// Optimierte Partikelanimation mit allen Effekten
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
let fft;
let mic;
let buffer;
let lastFlowFieldUpdate = 0;
let targetFPS = 30;
let skipCount = 0;
let rainbowOffset = 0;
let particleExplosions = [];
let orbitalRings = [];

const WORDS = ['DREAM', 'MAGIC', 'CHAOS', 'SPACE'];
const CELL_SIZE = 20;
const FLOW_UPDATE_INTERVAL = 200;
const COLS = Math.floor(window.innerWidth / CELL_SIZE);
const ROWS = Math.floor(window.innerHeight / CELL_SIZE);

function setup() {
	// Create canvas first
	createCanvas(windowWidth, windowHeight, WEBGL);
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 1.0);

	// Create buffer
	buffer = createGraphics(width, height);
	buffer.colorMode(HSB, 360, 100, 100, 1.0);
	buffer.background(0, 0, 0, 0);

	// Audio Setup with error handling
	try {
		mic = new p5.AudioIn();
		mic.start();
		fft = new p5.FFT();
		
		fft.setInput(mic);
	} catch (e) {
		console.error('Audio initialization failed:', e);
		// Provide fallback values
		mic = { getLevel: () => 0.5 };
		fft = {
			analyze: () => new Array(1024).fill(128),
			getEnergy: () => 128,
		};
	}

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
			speed: random(0.0001, 0.001),
			offset: random(1000),
		});
	}

	// Sterne initialisieren
	stars = new Array(200).fill().map(() => ({
		x: random(width),
		y: random(height),
		size: random(1, 3),
		twinkleSpeed: random(0.02, 0.05),
		twinkleOffset: random(1000),
	}));

	// Kometen initialisieren
	for (let i = 0; i < 3; i++) {
		createNewComet();
	}

	// Initialize orbital rings
	for (let i = 0; i < 3; i++) {
		orbitalRings.push({
			radius: random(100, 300),
			speed: random(0.001, 0.003),
			thickness: random(2, 5),
			hue: random(360),
		});
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
	for (let i = 0; i < width; i += 8) {
		for (let j = 0; j < height; j += 8) {
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

function drawCosmicTrails() {
	buffer.noStroke();
	for (let i = 0; i < vehicles.length; i += skipCount * 2) {
		for (let j = i + 1; j < vehicles.length; j += skipCount * 2) {
			let d = p5.Vector.dist(vehicles[i].pos, vehicles[j].pos);
			if (d < 80) {
				let alpha = map(d, 0, 80, 0.3, 0);
				let midPoint = p5.Vector.lerp(vehicles[i].pos, vehicles[j].pos, 0.5);

				// Create a stardust effect
				for (let k = 0; k < 3; k++) {
					let offset = p5.Vector.random2D().mult(5);
					let starPos = p5.Vector.add(midPoint, offset);
					let starSize = random(2, 4);

					buffer.fill((vehicles[i].hue + vehicles[j].hue) / 2, 80, 100, alpha);
					buffer.circle(starPos.x, starPos.y, starSize);
				}
			}
		}
	}
}

function drawEnergyWaves() {
	buffer.noFill();
	for (let i = 0; i < vehicles.length; i += skipCount * 2) {
		for (let j = i + 1; j < vehicles.length; j += skipCount * 2) {
			let d = p5.Vector.dist(vehicles[i].pos, vehicles[j].pos);
			if (d < 80) {
				let alpha = map(d, 0, 80, 0.4, 0);
				let midPoint = p5.Vector.lerp(vehicles[i].pos, vehicles[j].pos, 0.5);

				// Draw concentric circles
				for (let r = 0; r < d; r += 10) {
					buffer.stroke((vehicles[i].hue + time * 2) % 360, 80, 100, alpha);
					buffer.circle(midPoint.x, midPoint.y, r);
				}
			}
		}
	}
}

function drawParticleBridges() {
	buffer.noStroke();
	for (let i = 0; i < vehicles.length; i += skipCount * 2) {
		for (let j = i + 1; j < vehicles.length; j += skipCount * 2) {
			let d = p5.Vector.dist(vehicles[i].pos, vehicles[j].pos);
			if (d < 80) {
				let steps = 5;
				for (let t = 0; t <= steps; t++) {
					let progress = t / steps;
					let x = lerp(vehicles[i].pos.x, vehicles[j].pos.x, progress);
					let y = lerp(vehicles[i].pos.y, vehicles[j].pos.y, progress);

					// Add some waviness
					let offset = sin(progress * PI + time * 2) * 10;
					y += offset;

					let alpha = map(d, 0, 80, 0.3, 0) * sin(progress * PI);
					let hue = lerp(vehicles[i].hue, vehicles[j].hue, progress);

					buffer.fill(hue, 80, 100, alpha);
					buffer.circle(x, y, 4);
				}
			}
		}
	}
}

function drawMagneticFields() {
	buffer.noFill();
	for (let i = 0; i < vehicles.length; i += skipCount * 2) {
		for (let j = i + 1; j < vehicles.length; j += skipCount * 2) {
			let d = p5.Vector.dist(vehicles[i].pos, vehicles[j].pos);
			if (d < 80) {
				let alpha = map(d, 0, 80, 0.2, 0);
				let mid = p5.Vector.lerp(vehicles[i].pos, vehicles[j].pos, 0.5);

				buffer.stroke((time * 50) % 360, 80, 100, alpha);
				buffer.beginShape();
				for (let t = 0; t <= 1; t += 0.1) {
					let x = bezierPoint(
						vehicles[i].pos.x,
						mid.x + sin(time) * 50,
						mid.x - sin(time) * 50,
						vehicles[j].pos.x,
						t
					);
					let y = bezierPoint(
						vehicles[i].pos.y,
						mid.y + cos(time) * 50,
						mid.y - cos(time) * 50,
						vehicles[j].pos.y,
						t
					);
					buffer.vertex(x, y);
				}
				buffer.endShape();
			}
		}
	}
}

function draw() {
	console.log('Drawing frame:', frameCount);
	// Performance monitoring und Anpassung
	const currentFPS = frameRate();
	skipCount = currentFPS < targetFPS ? 2 : 1;

	// Clear und translate für WEBGL
	clear();
	translate(-width / 2, -height / 2);

	// Audio Analyse
	let spectrum = fft.analyze();
	let bass = fft.getEnergy('bass');
	let treble = fft.getEnergy('treble');
	let soundLevel = mic.getLevel();

	let bassIntensity = map(bass, 0, 255, 0.5, 1.5);
	let trebleIntensity = map(treble, 0, 255, 0.5, 1.5);
	let soundIntensity = map(soundLevel, 0, 1, 0.5, 2);

	// Buffer aktualisieren
	buffer.clear();
	buffer.background(0, 0, 0, 0);

	// Haupteffekte zeichnen
	drawBackgroundToBuffer(bassIntensity);

	// Flow Field aktualisieren
	if (millis() - lastFlowFieldUpdate > FLOW_UPDATE_INTERVAL) {
		updateFlowField(soundIntensity);
		lastFlowFieldUpdate = millis();
	}

	// Shockwaves zeichnen
	updateShockwaves();

	// Hauptpartikel aktualisieren
	updateMainParticles(trebleIntensity);

	// Update rainbow offset
	rainbowOffset += 0.5;

	// Draw orbital rings
	drawOrbitalRings();

	// Update particle explosions
	updateParticleExplosions();

	// Draw lightning between nearby particles
	if (frameCount % (skipCount * 5) === 0) {
		drawMagneticFields();
		// drawParticleBridges();
		// drawEnergyWaves();
		// drawCosmicTrails();
	}

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
	// Modify the start of this function to ensure proper background
	buffer.push();
	buffer.background(0, 0, 10); // Set a very dark background base
	
	// Create a dynamic gradient background
	let t = time * 0.1;
	for (let y = 0; y < height; y += 2) {
		let progress = y / height;
		let hue = (240 + sin(t + progress * PI) * 30) % 360;
		let sat = 30 + cos(t * 0.5 + progress * PI) * 10;
		buffer.stroke(hue, sat, 15 + sin(t) * 5);
		buffer.line(0, y, width, y);
	}
	buffer.pop();

	// Add subtle aurora borealis effect
	drawAuroraBorealis(intensity);
	
	// Enhanced nebulae
	drawEnhancedNebulae(intensity);
	
	// Dynamic star clusters
	drawEnhancedStars(intensity);
	
	// Add cosmic dust particles
	drawCosmicDust(intensity);
	
	// Enhanced galaxy spiral
	if (frameCount % skipCount === 0) {
		drawEnhancedGalaxySpiral(intensity);
	}
	
	// Update and draw enhanced comets
	updateAndDrawEnhancedComets();
}

function drawAuroraBorealis(intensity) {
	buffer.noFill();
	let auroraY = height * 0.3;
	
	for (let i = 0; i < 5; i++) {
		let waveOffset = i * 50;
		buffer.beginShape();
		for (let x = 0; x < width; x += 10) {
			let xOff = (x + time * 100) * 0.002;
			let yOff = noise(xOff, time * 0.5 + i) * 150;
			let alpha = map(noise(xOff, time), 0, 1, 0.1, 0.3) * intensity;
			
			buffer.stroke((180 + i * 30) % 360, 80, 100, alpha);
			buffer.curveVertex(x, auroraY + yOff + waveOffset);
		}
		buffer.endShape();
	}
}

function drawEnhancedNebulae(intensity) {
	buffer.noStroke();
	
	for (let nebula of nebulae) {
		let size = nebula.size * (1 + intensity * 0.2);
		
		// Create multiple layers with different colors
		for (let layer = 0; layer < 3; layer++) {
			let layerSize = size * (1 - layer * 0.2);
			let alpha = map(noise(nebula.offset + time * 0.3 + layer), 0, 1, 0.1, 0.3);
			
			buffer.push();
			buffer.translate(nebula.x, nebula.y);
			buffer.rotate(time * 0.1 + layer);
			
			// Create fractal-like patterns
			for (let i = 0; i < 3; i++) {
				let hue = (nebula.hue + layer * 30 + time * 5) % 360;
				buffer.fill(hue, 60, 80, alpha);
				
				buffer.beginShape();
				for (let a = 0; a < TWO_PI; a += 0.2) {
					let r = layerSize * noise(
						cos(a) + time * 0.1,
						sin(a) + time * 0.1,
						nebula.offset + layer
					);
					let x = r * cos(a) * (1 + sin(time + a) * 0.2);
					let y = r * sin(a) * (1 + cos(time + a) * 0.2);
					buffer.curveVertex(x, y);
				}
				buffer.endShape(CLOSE);
			}
			buffer.pop();
		}
		nebula.offset += 0.001;
	}
}

function drawEnhancedStars(intensity) {
	buffer.noStroke();
	
	// Create star clusters
	for (let star of stars) {
		let twinkle = sin(time * star.twinkleSpeed + star.twinkleOffset);
		let size = star.size * (1 + twinkle * 0.5) * (1 + intensity * 0.2);
		
		// Create a glow effect
		for (let i = 0; i < 3; i++) {
			let glowSize = size * (3 - i);
			let alpha = map(twinkle, -1, 1, 0.1, 0.3) / (i + 1);
			
			buffer.fill(45, 30, 100, alpha);
			buffer.circle(star.x, star.y, glowSize);
		}
		
		// Core of the star
		buffer.fill(0, 0, 100, 0.8);
		buffer.circle(star.x, star.y, size);
		
		// Add random sparkles
		if (random() < 0.1) {
			let sparkleSize = random(1, 3);
			let sparkleX = star.x + random(-10, 10);
			let sparkleY = star.y + random(-10, 10);
			buffer.fill(0, 0, 100, random(0.3, 0.6));
			buffer.circle(sparkleX, sparkleY, sparkleSize);
		}
	}
}

function drawCosmicDust(intensity) {
	buffer.noStroke();
	
	for (let i = 0; i < 50; i++) {
		let x = (noise(i, time * 0.5) * width * 1.5) - width * 0.25;
		let y = (noise(i + 100, time * 0.5) * height * 1.5) - height * 0.25;
		let size = noise(i, time) * 3 * intensity;
		let hue = (time * 20 + i * 10) % 360;
		
		buffer.fill(hue, 70, 100, 0.2);
		buffer.circle(x, y, size);
		
		// Add connecting lines between nearby dust particles
		for (let j = i + 1; j < 50; j++) {
			let x2 = (noise(j, time * 0.5) * width * 1.5) - width * 0.25;
			let y2 = (noise(j + 100, time * 0.5) * height * 1.5) - height * 0.25;
			let d = dist(x, y, x2, y2);
			
			if (d < 50) {
				buffer.stroke(hue, 70, 100, map(d, 0, 50, 0.2, 0));
				buffer.line(x, y, x2, y2);
			}
		}
	}
}

function drawEnhancedGalaxySpiral(intensity) {
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

function updateAndDrawEnhancedComets() {
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

function drawOrbitalRings() {
	buffer.push();
	buffer.translate(width / 2, height / 2);
	for (let ring of orbitalRings) {
		buffer.noFill();
		buffer.strokeWeight(ring.thickness);
		buffer.stroke(ring.hue, 80, 100, 0.3);

		let deformedRadius = ring.radius + sin(time * 2) * 20;
		buffer.beginShape();
		for (let a = 0; a < TWO_PI; a += 0.1) {
			let r = deformedRadius + noise(a, time) * 30;
			let x = cos(a + time * ring.speed) * r;
			let y = sin(a + time * ring.speed) * r;
			buffer.vertex(x, y);
		}
		buffer.endShape(CLOSE);
	}
	buffer.pop();
}

function createParticleExplosion(x, y) {
	let particles = [];
	for (let i = 0; i < 12; i++) {
		particles.push({
			pos: createVector(x, y),
			vel: p5.Vector.random2D().mult(random(2, 6)),
			life: 1,
			hue: random(360),
		});
	}
	particleExplosions.push(particles);
}

function updateParticleExplosions() {
	for (let i = particleExplosions.length - 1; i >= 0; i--) {
		let particles = particleExplosions[i];

		buffer.noStroke();
		for (let p of particles) {
			p.pos.add(p.vel);
			p.life *= 0.95;

			buffer.fill(p.hue, 80, 100, p.life);
			buffer.circle(p.pos.x, p.pos.y, 5 * p.life);
		}

		if (particles[0].life < 0.01) {
			particleExplosions.splice(i, 1);
		}
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
		this.trailLength = 5;
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

		if (frameCount % skipCount === 0) {
			this.trailPoints.unshift({ pos: this.pos.copy(), alpha: 1 });
			if (this.trailPoints.length > this.trailLength) {
				this.trailPoints.pop();
			}
		}

		for (let point of this.trailPoints) {
			point.alpha *= 0.8;
		}

		if (this.pos.x > width) this.pos.x = 0;
		if (this.pos.x < 0) this.pos.x = width;
		if (this.pos.y > height) this.pos.y = 0;
		if (this.pos.y < 0) this.pos.y = height;
	}

	display(intensity) {
		if (this.trailPoints.length > 0) {
			for (let i = 0; i < this.trailPoints.length; i += skipCount) {
				let point = this.trailPoints[i];
				let size = map(i, 0, this.trailPoints.length, this.r, 1);
				buffer.noStroke();
				buffer.fill(this.hue, 80, 100, point.alpha * 0.3);
				buffer.ellipse(point.pos.x, point.pos.y, size * intensity * 2);
			}
		}

		let shiftedHue = (this.hue + rainbowOffset) % 360;

		let scale = 1 + (intensity - 1) * 2;

		buffer.push();
		buffer.translate(this.pos.x, this.pos.y);
		buffer.rotate(this.vel.heading());

		for (let i = 5; i > 0; i--) {
			buffer.fill(shiftedHue, 80, 100, 0.2 / i);
			this.drawParticleShape(this.r * i * scale);
		}

		buffer.fill(shiftedHue, 80, 100, 0.8);
		this.drawParticleShape(this.r * scale);
		buffer.pop();
	}

	drawParticleShape(size) {
		buffer.beginShape();
		buffer.vertex(-size, -size / 2);
		buffer.vertex(-size, size / 2);
		buffer.vertex(size, 0);
		buffer.endShape(CLOSE);
	}

	applyForce(force) {
		this.acc.add(force);
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

		// Add multiple shockwaves and explosions
		for (let i = 0; i < 5; i++) {
			setTimeout(() => {
				let x = width / 2 + random(-100, 100);
				let y = height / 2 + random(-100, 100);
				createShockwave(x, y);
				createParticleExplosion(x, y);
			}, i * 200);
		}
	}
}

function mousePressed() {
	createShockwave(mouseX, mouseY);
	createParticleExplosion(mouseX, mouseY);

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
