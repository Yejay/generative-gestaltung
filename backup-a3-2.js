let nebulae = [];
let stars = [];
let comets = [];
let vehicles = [];
let targetPoints = [];
let flowField = [];
let shockwaves = [];
let time = 0;
let wordIndex = 0;
let isTransitioning = false;
let attractMode = true;
let forceActive = false;
let galaxyAngle = 0;
let buffer;
let lastFlowFieldUpdate = 0;
let targetFPS = 30;
let skipCount = 0;

const WORDS = ['DREAM', 'MAGIC', 'CHAOS', 'SPACE'];
const CELL_SIZE = 10;
const FLOW_UPDATE_INTERVAL = 100; // ms zwischen Flow Field Updates
const COLS = Math.floor(window.innerWidth / CELL_SIZE);
const ROWS = Math.floor(window.innerHeight / CELL_SIZE);

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	// TODO
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 1.0);

	// Create buffer
	buffer = createGraphics(width, height);
	buffer.colorMode(HSB, 360, 100, 100, 1.0);

	// Initialize other components
	initEffects();
	initFlowField();
	generateTextPoints(WORDS[wordIndex]);
}

function initEffects() {
	// Nebel initialisieren
	for (let i = 0; i < 5; i++) {
		nebulae.push({
			x: random(width),
			y: random(height),
			size: random(100, 300),
			hue: random(360),
			alpha: random(0.1, 0.2),
			offset: random(1000),
		});
	}

	// Sterne initialisieren
	stars = new Array(200).fill().map(() => ({
		x: random(width),
		y: random(height),
		size: random(1, 3),
	}));

	// Kometen initialisieren
	for (let i = 0; i < 3; i++) {
		createNewComet();
	}
}

function initFlowField() {
	flowField = Array(ROWS)
		.fill()
		.map(() =>
			Array(COLS)
				.fill()
				.map(() => noise(random(1000)) * TWO_PI)
		);
}

function createNewComet() {
	comets.push({
		pos: createVector(random(width), random(height)),
		vel: p5.Vector.random2D().mult(random(3, 8)),
		length: random(20, 40),
		hue: random(360),
		alive: true,
		trail: [],
	});
}

function generateTextPoints(text) {
	vehicles = [];
	targetPoints = [];

	let tempBuffer = createGraphics(width, height);
	tempBuffer.background(0);
	tempBuffer.fill(255);
	tempBuffer.textAlign(CENTER, CENTER);
	tempBuffer.textSize(text.length > 4 ? 120 : 150);
	tempBuffer.text(text, width / 2, height / 2);

	tempBuffer.loadPixels();
	for (let i = 0; i < width; i += 10) {
		for (let j = 0; j < height; j += 6) {
			let index = (i + j * width) * 4;
			if (tempBuffer.pixels[index] > 128) {
				let vehicle = new Vehicle(random(width), random(height), i, j);
				vehicles.push(vehicle);
				targetPoints.push(createVector(i, j));
			}
		}
	}
	tempBuffer.remove();
}

function createShockwave(x, y) {
	shockwaves.push({
		pos: createVector(x, y),
		radius: 0,
		maxRadius: 300,
		intensity: 1,
	});
}

function draw() {
	console.log('Drawing frame:', frameCount);
	// Performance monitoring und Anpassung
	const currentFPS = frameRate();
	skipCount = currentFPS < targetFPS ? 2 : 1;

	// Clear und translate für WEBGL
	clear();
	translate(-width / 2, -height / 2);

	// Buffer aktualisieren
	buffer.clear();

	// Haupteffekte zeichnen
	drawBackgroundToBuffer(1);

	// Flow Field aktualisieren
	if (millis() - lastFlowFieldUpdate > FLOW_UPDATE_INTERVAL) {
		updateFlowField(1);
		lastFlowFieldUpdate = millis();
	}

	// Shockwaves zeichnen
	updateShockwaves();

	// Hauptpartikel aktualisieren
	updateMainParticles(1);

	// Buffer auf Hauptcanvas zeichnen
	image(buffer, 0, 0);

	// Interaktions-Feedback
	drawForceIndicator();

	time += 0.01;

	// Debug Info
	fill(0, 0, 100);
	noStroke();
	text('FPS: ' + floor(currentFPS), 10, 20);

	if (frameCount === 1) {
		console.log('Buffer:', buffer);
		console.log('Vehicles:', vehicles);
		console.log('Flow field:', flowField);
	}
}

function drawBackgroundToBuffer(intensity) {
	// Basis Hintergrund
	buffer.background(240, 30, 15);

	// Nebel zeichnen
	drawNebulae(intensity);

	// Sterne zeichnen
	drawStars(intensity);

	// Galaxie-Effekt
	if (frameCount % skipCount === 0) {
		drawGalaxySpiral(intensity);
	}

	// Kometen
	updateAndDrawComets();
}

function drawNebulae() {
	buffer.noStroke();

	for (let nebula of nebulae) {
		buffer.push();
		buffer.translate(nebula.x, nebula.y);
		buffer.fill(nebula.hue, 60, 80, nebula.alpha);

		// Simplified noise-based shape
		buffer.beginShape();
		for (let a = 0; a < TWO_PI; a += 0.5) {
			let r =
				nebula.size * noise(cos(a) + nebula.offset, sin(a) + nebula.offset);
			let x = r * cos(a);
			let y = r * sin(a);
			buffer.vertex(x, y);
		}
		buffer.endShape(CLOSE);

		buffer.pop();
	}
}

function drawStars() {
	buffer.noStroke();
	buffer.fill(0, 0, 100, 0.8);

	for (let star of stars) {
		buffer.ellipse(star.x, star.y, 2);
	}
}

function drawGalaxySpiral(intensity) {
	buffer.push();
	buffer.translate(width / 2, height / 2);

	let arms = 2;
	let points = 50;

	for (let arm = 0; arm < arms; arm++) {
		let armOffset = (TWO_PI / arms) * arm;

		buffer.beginShape();
		buffer.noFill();

		for (let i = 0; i < points; i += skipCount) {
			let t = i / points;
			let angle = t * TWO_PI * 2 + armOffset + galaxyAngle;
			let radius = t * min(width, height) * 0.4;

			let x = cos(angle) * radius;
			let y = sin(angle) * radius;

			let alpha = map(t, 0, 1, 0.3, 0);
			buffer.stroke(280, 80, 100, alpha);
			buffer.vertex(x, y);
		}
		buffer.endShape();
	}

	galaxyAngle += 0.001 * intensity;
	buffer.pop();
}

function updateAndDrawComets() {
	for (let comet of comets) {
		comet.pos.add(comet.vel);
		comet.trail.unshift({ pos: comet.pos.copy(), alpha: 1 });

		if (comet.trail.length > 20) {
			comet.trail.pop();
		}

		buffer.noFill();
		for (let i = 0; i < comet.trail.length; i++) {
			let point = comet.trail[i];
			let alpha = map(i, 0, comet.trail.length, 1, 0);

			buffer.stroke(comet.hue, 80, 100, alpha * 0.5);
			buffer.strokeWeight(3 * (1 - i / comet.trail.length));

			if (i > 0) {
				let prev = comet.trail[i - 1];
				buffer.line(point.pos.x, point.pos.y, prev.pos.x, prev.pos.y);
			}
		}

		buffer.noStroke();
		buffer.fill(comet.hue, 80, 100);
		buffer.ellipse(comet.pos.x, comet.pos.y, 6);

		if (
			comet.pos.x < 0 ||
			comet.pos.x > width ||
			comet.pos.y < 0 ||
			comet.pos.y > height
		) {
			comet.alive = false;
		}
	}

	comets = comets.filter((c) => c.alive);
	while (comets.length < 3) {
		createNewComet();
	}
}

function updateFlowField(intensity) {
	for (let y = 0; y < ROWS; y++) {
		for (let x = 0; x < COLS; x++) {
			let angle = noise(x * 0.1, y * 0.1, time * 0.2) * TWO_PI;
			flowField[y][x] = angle * intensity;
		}
	}
}

function updateShockwaves() {
	for (let i = shockwaves.length - 1; i >= 0; i--) {
		let wave = shockwaves[i];
		wave.radius += 10;
		wave.intensity *= 0.95;

		buffer.noFill();
		buffer.stroke(0, 0, 100, wave.intensity);
		buffer.strokeWeight(2);
		buffer.ellipse(wave.pos.x, wave.pos.y, wave.radius * 2);

		if (wave.radius > wave.maxRadius) {
			shockwaves.splice(i, 1);
		}
	}
}

function updateMainParticles(intensity) {
	for (let vehicle of vehicles) {
		let x = floor(vehicle.pos.x / CELL_SIZE);
		let y = floor(vehicle.pos.y / CELL_SIZE);
		x = constrain(x, 0, COLS - 1);
		y = constrain(y, 0, ROWS - 1);
		let angle = flowField[y][x];
		let flowForce = p5.Vector.fromAngle(angle).mult(0.1);

		vehicle.applyForce(flowForce);

		let mouse = createVector(mouseX, mouseY);
		let d = p5.Vector.dist(mouse, vehicle.pos);

		if (forceActive && d < 150) {
			let force = attractMode ? vehicle.attract(mouse) : vehicle.repel(mouse);
			vehicle.applyForce(force.mult(5));
		}

		vehicle.behaviors(intensity);
		vehicle.update();
		vehicle.display(intensity);
	}
}

function drawForceIndicator() {
	if (forceActive) {
		push();
		noFill();
		strokeWeight(2);
		if (attractMode) {
			stroke(120, 100, 100);
			ellipse(mouseX, mouseY, 30);
			stroke(120, 100, 100, 0.5);
			ellipse(mouseX, mouseY, 20);
			stroke(120, 100, 100);
			for (let angle = 0; angle < TWO_PI; angle += PI / 4) {
				let x1 = mouseX + cos(angle) * 20;
				let y1 = mouseY + sin(angle) * 20;
				let x2 = mouseX + cos(angle) * 15;
				let y2 = mouseY + sin(angle) * 15;
				line(x1, y1, x2, y2);
			}
		} else {
			stroke(0, 100, 100);
			ellipse(mouseX, mouseY, 30);
			stroke(0, 100, 100, 0.5);
			ellipse(mouseX, mouseY, 20);
			stroke(0, 100, 100);
			for (let angle = 0; angle < TWO_PI; angle += PI / 4) {
				let x1 = mouseX + cos(angle) * 15;
				let y1 = mouseY + sin(angle) * 15;
				let x2 = mouseX + cos(angle) * 20;
				let y2 = mouseY + sin(angle) * 20;
				line(x1, y1, x2, y2);
			}
		}
		pop();
	}
}

function keyPressed() {
	if (key === ' ' && !isTransitioning) {
		isTransitioning = true;

		// Aktuelle Partikel zum Rand fliegen lassen
		for (let vehicle of vehicles) {
			vehicle.target = createVector(
				random([-100, width + 100]),
				random([-100, height + 100])
			);
		}

		// Nach kurzer Verzögerung neues Wort generieren
		setTimeout(() => {
			wordIndex = (wordIndex + 1) % WORDS.length;
			generateTextPoints(WORDS[wordIndex]);
			createShockwave(width / 2, height / 2);
			isTransitioning = false;
		}, 1000);
	}
}

function mousePressed() {
	createShockwave(mouseX, mouseY);

	// Modus umschalten
	if (!forceActive) {
		// Wenn keine Kraft aktiv ist, starten wir mit Anziehung
		attractMode = true;
		forceActive = true;
	} else if (attractMode) {
		// Wenn Anziehung aktiv ist, wechseln zu Abstoßung
		attractMode = false;
		forceActive = true;
	} else {
		// Wenn Abstoßung aktiv ist, alles deaktivieren
		forceActive = false;
	}

	// Feedback in der Konsole
	console.log(
		'Status:',
		forceActive
			? attractMode
				? 'Anziehung aktiv'
				: 'Abstoßung aktiv'
			: 'Inaktiv'
	);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	buffer.resizeCanvas(windowWidth, windowHeight);
	generateTextPoints(WORDS[wordIndex]);
}
