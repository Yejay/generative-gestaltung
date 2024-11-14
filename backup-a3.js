// Particle Word Animation System
let vehicles = [];
let targetPoints = [];
let particles = [];
let flowField = [];
let shockwaves = [];
let time = 0;
let wordIndex = 0;
let isTransitioning = false;
let attractMode = true;
let forceActive = false;
let fft;
let mic;

let nebulae = [];
let stars = [];
let comets = [];
let galaxyCenter;
let galaxyAngle = 0;

// Wörter die animiert werden
const WORDS = ['DREAM', 'MAGIC', 'CHAOS', 'SPACE'];
const CELL_SIZE = 10;
const COLS = Math.floor(window.innerWidth / CELL_SIZE);
const ROWS = Math.floor(window.innerHeight / CELL_SIZE);

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 1.0);

	// Audio Setup
	mic = new p5.AudioIn();
	mic.start();
	fft = new p5.FFT();
	fft.setInput(mic);

	// Flow Field initialisieren
	initFlowField();

	initBackground();

	// Initial Text generieren
	generateTextPoints(WORDS[wordIndex]);

	// Hintergrundpartikel erstellen
	for (let i = 0; i < 100; i++) {
		particles.push(new BackgroundParticle());
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

function initBackground() {
	// Nebel-Effekte erstellen
	for (let i = 0; i < 5; i++) {
		nebulae.push({
			x: random(width),
			y: random(height),
			size: random(100, 300),
			hue: random(360),
			speed: random(0.0001, 0.001),
			offset: random(1000),
		});
	}

	// Sterne erstellen
	for (let i = 0; i < 200; i++) {
		stars.push({
			x: random(width),
			y: random(height),
			size: random(1, 3),
			twinkleSpeed: random(0.02, 0.05),
			twinkleOffset: random(1000),
		});
	}

	// Kometen initialisieren
	for (let i = 0; i < 3; i++) {
		createNewComet();
	}

	// Galaxienzentrum festlegen
	galaxyCenter = createVector(width / 2, height / 2);
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

function drawBackground(bassIntensity) {
	// Basis-Hintergrund mit Farbverlauf
	let bgColor1 = color(240, 30, 15); // Dunkles Blau
	let bgColor2 = color(280, 40, 20); // Dunkles Lila

	for (let y = 0; y < height; y++) {
		let inter = map(y, 0, height, 0, 1);
		let c = lerpColor(bgColor1, bgColor2, inter);
		stroke(c);
		line(0, y, width, y);
	}

	// Nebel zeichnen
	drawNebulae(bassIntensity);

	// Sterne zeichnen
	drawStars(bassIntensity);

	// Kometen aktualisieren und zeichnen
	updateAndDrawComets();

	// Galaxie-Spiraleffekt
	drawGalaxySpiral(bassIntensity);
}

function drawNebulae(intensity) {
	for (let nebula of nebulae) {
		let size = nebula.size * (1 + intensity * 0.2);
		let alpha = map(noise(nebula.offset + time * nebula.speed), 0, 1, 0.1, 0.3);

		for (let i = 3; i > 0; i--) {
			let adjustedSize = size * i * 0.7;
			let adjustedAlpha = alpha / i;

			push();
			translate(nebula.x, nebula.y);
			rotate(time * nebula.speed);

			// Nebel-Gradient
			drawingContext.shadowBlur = 30;
			drawingContext.shadowColor = color(nebula.hue, 80, 100);

			noStroke();
			fill(nebula.hue, 60, 80, adjustedAlpha);
			beginShape();
			for (let a = 0; a < TWO_PI; a += 0.2) {
				let xoff = map(cos(a), -1, 1, 0, 2);
				let yoff = map(sin(a), -1, 1, 0, 2);
				let r =
					adjustedSize *
					noise(xoff + time * 0.1, yoff + time * 0.1, nebula.offset);
				let x = r * cos(a);
				let y = r * sin(a);
				curveVertex(x, y);
			}
			endShape(CLOSE);
			pop();
		}

		nebula.offset += 0.001;
	}
}

function drawStars(intensity) {
	for (let star of stars) {
		let twinkle = sin(time * star.twinkleSpeed + star.twinkleOffset);
		let size = star.size * (1 + twinkle * 0.5) * (1 + intensity * 0.2);
		let alpha = map(twinkle, -1, 1, 0.5, 1);

		// Stern-Glühen
		drawingContext.shadowBlur = 15;
		drawingContext.shadowColor = color(0, 0, 100);

		noStroke();
		fill(0, 0, 100, alpha);

		// Stern mit Strahlen
		push();
		translate(star.x, star.y);
		rotate(time * 0.1);

		// Hauptstern
		ellipse(0, 0, size);

		// Strahlen
		for (let a = 0; a < TWO_PI; a += PI / 4) {
			let rayLength = size * 2 * alpha;
			line(0, 0, cos(a) * rayLength, sin(a) * rayLength);
		}

		pop();
	}
}

function updateAndDrawComets() {
	for (let comet of comets) {
		// Kometen-Bewegung
		comet.pos.add(comet.vel);
		comet.trail.unshift({ pos: comet.pos.copy(), alpha: 1 });

		// Trail begrenzen
		if (comet.trail.length > 20) {
			comet.trail.pop();
		}

		// Trail zeichnen
		noFill();
		for (let i = 0; i < comet.trail.length; i++) {
			let point = comet.trail[i];
			let alpha = map(i, 0, comet.trail.length, 1, 0);

			// Schweif-Glühen
			drawingContext.shadowBlur = 20;
			drawingContext.shadowColor = color(comet.hue, 80, 100);

			stroke(comet.hue, 80, 100, alpha * 0.5);
			strokeWeight(3 * (1 - i / comet.trail.length));
			if (i > 0) {
				let prev = comet.trail[i - 1];
				line(point.pos.x, point.pos.y, prev.pos.x, prev.pos.y);
			}
		}

		// Komet-Kopf
		noStroke();
		fill(comet.hue, 80, 100);
		ellipse(comet.pos.x, comet.pos.y, 6);

		// Bildschirmrand-Check
		if (
			comet.pos.x < 0 ||
			comet.pos.x > width ||
			comet.pos.y < 0 ||
			comet.pos.y > height
		) {
			comet.alive = false;
		}
	}

	// Tote Kometen entfernen und neue erstellen
	comets = comets.filter((c) => c.alive);
	while (comets.length < 3) {
		createNewComet();
	}
}

function drawGalaxySpiral(intensity) {
	push();
	translate(width / 2, height / 2);

	let arms = 2;
	let rotations = 2;
	let points = 100;

	for (let arm = 0; arm < arms; arm++) {
		let armOffset = (TWO_PI / arms) * arm;

		beginShape();
		for (let i = 0; i < points; i++) {
			let t = i / points;
			let angle = t * TWO_PI * rotations + armOffset + galaxyAngle;
			let radius = t * min(width, height) * 0.4;

			let x = cos(angle) * radius;
			let y = sin(angle) * radius;

			let alpha = map(t, 0, 1, 0.3, 0);
			stroke(280, 80, 100, alpha);
			strokeWeight(2);
			point(x, y);
		}
		endShape();
	}

	galaxyAngle += 0.001 * intensity;
	pop();
}

function generateTextPoints(text) {
	vehicles = [];
	targetPoints = [];

	let buffer = createGraphics(width, height);
	buffer.background(0);
	buffer.fill(255);
	buffer.textAlign(CENTER, CENTER);
	buffer.textSize(text.length > 4 ? 120 : 150);
	buffer.text(text, width / 2, height / 2);

	buffer.loadPixels();
	for (let i = 0; i < width; i += 6) {
		for (let j = 0; j < height; j += 6) {
			let index = (i + j * width) * 4;
			if (buffer.pixels[index] > 128) {
				let vehicle = new Vehicle(random(width), random(height), i, j);
				vehicles.push(vehicle);
				targetPoints.push(createVector(i, j));
			}
		}
	}
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
	// Audio Analyse
	let spectrum = fft.analyze();
	let bass = fft.getEnergy('bass');
	let treble = fft.getEnergy('treble');
	let soundLevel = mic.getLevel();

	// Normalisierte Werte
	let bassIntensity = map(bass, 0, 255, 0.5, 1.5);
	let trebleIntensity = map(treble, 0, 255, 0.5, 1.5);
	let soundIntensity = map(soundLevel, 0, 1, 0.5, 2);

	// Neuer Hintergrund
	drawBackground(bassIntensity);

	// Rest des draw-Codes bleibt gleich...
	updateFlowField(soundIntensity);
	updateBackgroundParticles(bassIntensity);
	updateShockwaves();
	updateMainParticles(trebleIntensity);

	// Visuelles Feedback für aktiven Status
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
			let arrowSize = 8;
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
			let arrowSize = 8;
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

	time += 0.01;
}

function updateFlowField(intensity) {
	for (let y = 0; y < ROWS; y++) {
		for (let x = 0; x < COLS; x++) {
			let angle = noise(x * 0.1, y * 0.1, time * 0.2) * TWO_PI;
			flowField[y][x] = angle * intensity;
		}
	}
}

function updateBackgroundParticles(intensity) {
	for (let particle of particles) {
		particle.update(intensity);
		particle.display();
	}
}

function updateShockwaves() {
	for (let i = shockwaves.length - 1; i >= 0; i--) {
		let wave = shockwaves[i];
		wave.radius += 10;
		wave.intensity *= 0.95;

		noFill();
		stroke(0, 0, 100, wave.intensity);
		strokeWeight(2);
		ellipse(wave.pos.x, wave.pos.y, wave.radius * 2);

		if (wave.radius > wave.maxRadius) {
			shockwaves.splice(i, 1);
		}
	}
}

function updateMainParticles(intensity) {
	for (let vehicle of vehicles) {
		// Flow Field Kraft anwenden
		let x = floor(vehicle.pos.x / CELL_SIZE);
		let y = floor(vehicle.pos.y / CELL_SIZE);
		x = constrain(x, 0, COLS - 1);
		y = constrain(y, 0, ROWS - 1);
		let angle = flowField[y][x];
		let flowForce = p5.Vector.fromAngle(angle).mult(0.1);

		vehicle.applyForce(flowForce);

		// Persistente Mausinteraktion
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

class Vehicle {
	constructor(x, y, targetX, targetY) {
		this.pos = createVector(x, y);
		this.vel = p5.Vector.random2D();
		this.acc = createVector();
		this.target = createVector(targetX, targetY);
		this.maxSpeed = random(8, 12);
		this.maxForce = random(0.8, 1.2);
		this.r = random(4, 8);
		this.hue = random(360);
		this.trailPoints = [];
	}

	behaviors(intensity) {
		let arrive = this.arrive(this.target);
		let wander = this.wander();

		arrive.mult(0.6);
		wander.mult(0.1);

		this.applyForce(arrive);
		this.applyForce(wander);
	}

	arrive(target) {
		let desired = p5.Vector.sub(target, this.pos);
		let d = desired.mag();
		let speed = this.maxSpeed;

		if (d < 100) {
			speed = map(d, 0, 100, 0, this.maxSpeed);
		}

		desired.setMag(speed);
		let steer = p5.Vector.sub(desired, this.vel);
		steer.limit(this.maxForce);
		return steer;
	}

	wander() {
		let angle = noise(this.pos.x * 0.01, this.pos.y * 0.01, time) * TWO_PI * 2;
		return p5.Vector.fromAngle(angle).mult(0.1);
	}

	attract(target) {
		let force = p5.Vector.sub(target, this.pos);
		let d = force.mag();
		d = constrain(d, 20, 100);
		force.normalize();
		let strength = 0.5 / (d * 0.05);
		force.mult(strength);
		return force;
	}

	repel(target) {
		let force = p5.Vector.sub(this.pos, target);
		let d = force.mag();
		d = constrain(d, 20, 100);
		force.normalize();
		let strength = 0.8 / (d * 0.05);
		force.mult(strength);
		return force;
	}

	update() {
		this.pos.add(this.vel);
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.acc.mult(0);

		// Trail updaten
		this.trailPoints.unshift({ pos: this.pos.copy(), alpha: 1 });
		if (this.trailPoints.length > 10) {
			this.trailPoints.pop();
		}

		for (let point of this.trailPoints) {
			point.alpha *= 0.8;
		}

		// Bildschirmränder behandeln
		if (this.pos.x > width) this.pos.x = 0;
		if (this.pos.x < 0) this.pos.x = width;
		if (this.pos.y > height) this.pos.y = 0;
		if (this.pos.y < 0) this.pos.y = height;
	}

	display(intensity) {
		// Trail zeichnen
		for (let i = 0; i < this.trailPoints.length; i++) {
			let point = this.trailPoints[i];
			let size = map(i, 0, this.trailPoints.length, this.r, 1);

			noStroke();
			fill(this.hue, 80, 100, point.alpha * 0.3);
			ellipse(point.pos.x, point.pos.y, size * intensity * 2);
		}

		// Hauptpartikel zeichnen
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());

		// Glüheffekt mit Intensität
		for (let i = 3; i > 0; i--) {
			fill(this.hue, 80, 100, 0.3 / i);
			this.drawParticleShape(this.r * i * intensity);
		}

		fill(this.hue, 80, 100, 0.8);
		this.drawParticleShape(this.r);

		pop();
	}

	drawParticleShape(size) {
		beginShape();
		vertex(-size, -size / 2);
		vertex(-size, size / 2);
		vertex(size, 0);
		endShape(CLOSE);
	}

	applyForce(force) {
		this.acc.add(force);
	}
}

class BackgroundParticle {
	constructor() {
		this.pos = createVector(random(width), random(height));
		this.vel = createVector();
		this.acc = createVector();
		this.size = random(1, 3);
		this.alpha = random(0.3, 0.6);
		this.hue = random(360);
		this.maxSpeed = random(2, 4);
	}

	update(intensity) {
		let angle =
			noise(this.pos.x * 0.001, this.pos.y * 0.001, time * 0.5) * TWO_PI * 2;

		let noiseForce = p5.Vector.fromAngle(angle);
		noiseForce.mult(0.1 * intensity);
		this.acc.add(noiseForce);

		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0);

		if (this.pos.x < 0) this.pos.x = width;
		if (this.pos.x > width) this.pos.x = 0;
		if (this.pos.y < 0) this.pos.y = height;
		if (this.pos.y > height) this.pos.y = 0;
	}

	display() {
		noStroke();
		fill(this.hue, 50, 100, this.alpha);
		ellipse(this.pos.x, this.pos.y, this.size);
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

	// Erst den Modus umschalten
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
	generateTextPoints(WORDS[wordIndex]);
}
