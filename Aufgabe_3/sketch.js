let nebulae = [];
let stars = [];
let comets = [];
let vehicles = [];
let targetPoints = [];
let wordIndex = 0;
let attractMode = true;
let forceActive = false;
let showFpsCounter = false;
let font;

const WORDS = ['DREAM', 'MAGIC', 'CHAOS', 'SPACE', 'FUCK'];

function preload() {
	font = loadFont(
		'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf'
	);
	attractCursor = loadImage(
		'https://img.icons8.com/?size=100&id=EDlqOuNnwBFU&format=png&color=000000'
	);
	repelCursor = loadImage(
		'https://img.icons8.com/?size=100&id=8Cpx9JrEbpOM&format=png&color=000000'
	);
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 1.0);
	initEffects();
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
	for (let i = 0; i < 10; i++) {
		createNewComet();
	}
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

	// Adjusts font size based on text length
	let fontSize = text.length > 4 ? 120 : 150;

	// Calculates text boundaries for centering
	let bounds = font.textBounds(text, 0, 0, fontSize);
	let centerX = width / 2 - bounds.w / 2;
	let centerY = height / 2 + bounds.h / 2;

	let points = font.textToPoints(text, centerX, centerY, fontSize, {
		sampleFactor: 0.1,
		simplifyThreshold: 0,
	});

	for (let p of points) {
		let vehicle = new Vehicle(random(width), random(height), p.x, p.y);
		vehicles.push(vehicle);
		targetPoints.push(createVector(p.x, p.y));
	}
}

function draw() {
	background(240, 30, 15);

	drawNebulae(1);
	drawStars();
	updateAndDrawComets();
	updateMainParticles(1);
	drawForceIndicator();

	showFps();
}

function drawNebulae() {
	noStroke();

	for (let nebula of nebulae) {
		push();
		translate(nebula.x, nebula.y);
		fill(nebula.hue, 60, 80, nebula.alpha);

		beginShape();
		for (let a = 0; a < TWO_PI; a += 0.5) {
			// Uses Perlin noise to create irregular radius
			let r =
				nebula.size * noise(cos(a) + nebula.offset, sin(a) + nebula.offset);
			let x = r * cos(a);
			let y = r * sin(a);
			vertex(x, y);
		}
		endShape(CLOSE);

		pop();
	}
}

function drawStars() {
	noStroke();
	fill(0, 0, 100, 0.8);

	for (let star of stars) {
		ellipse(star.x, star.y, 2);
	}
}

function updateAndDrawComets() {
	for (let comet of comets) {
		// Updates comet position based on its velocity
		comet.pos.add(comet.vel);

		// Draws the comet's tail using 3 gradually fading circles
		for (let i = 3; i > 0; i--) {
			let alpha = 0.3 / i;
			fill(comet.hue, 80, 100, alpha);
			ellipse(
				comet.pos.x - comet.vel.x * i * 2,
				comet.pos.y - comet.vel.y * i * 2,
				8
			);
		}

		fill(comet.hue, 80, 100);
		ellipse(comet.pos.x, comet.pos.y, 6);

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

function updateMainParticles(intensity) {
	for (let vehicle of vehicles) {
		vehicle.move(intensity);
		vehicle.update();
		vehicle.show(intensity);
	}
}

function drawForceIndicator() {
	noCursor();
	if (forceActive) {
		let cursorImage = attractMode ? attractCursor : repelCursor;
		imageMode(CENTER);
		image(cursorImage, mouseX, mouseY, 40, 40);
	}
}

function keyPressed() {
	if (key === ' ') {
		wordIndex = (wordIndex + 1) % WORDS.length;
		generateTextPoints(WORDS[wordIndex]);
	}
	if (key === 'f') {
		showFpsCounter = !showFpsCounter;
	}
}

function showFps() {
	if (showFpsCounter) {
		fill(0, 0, 100);
		noStroke();
		text('FPS: ' + floor(frameRate()), 10, 20);
	}
}

function mousePressed() {
	if (!forceActive) {
		attractMode = true;
		forceActive = true;
	} else if (attractMode) {
		attractMode = false;
		forceActive = true;
	} else {
		forceActive = false;
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	generateTextPoints(WORDS[wordIndex]);
}
