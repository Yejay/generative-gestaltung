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
let lastFlowFieldUpdate = 0;
let targetFPS = 30;
let skipCount = 0;
let font;

const WORDS = ['DREAM', 'MAGIC', 'CHAOS', 'SPACE'];
const CELL_SIZE = 10;
const FLOW_UPDATE_INTERVAL = 100; // ms zwischen Flow Field Updates
const COLS = Math.floor(window.innerWidth / CELL_SIZE);
const ROWS = Math.floor(window.innerHeight / CELL_SIZE);

function preload() {
	font = loadFont(
		'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf'
	);
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 1.0);

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

	// Get text bounds first to calculate centering
	let fontSize = text.length > 4 ? 120 : 150;
	let bounds = font.textBounds(text, 0, 0, fontSize);

	// Calculate center position
	let centerX = width / 2 - bounds.w / 2;
	let centerY = height / 2 + bounds.h / 2;

	// Get points for the text
	let points = font.textToPoints(text, centerX, centerY, fontSize, {
		sampleFactor: 0.1, // Adjust this value to get more or fewer points
		simplifyThreshold: 0,
	});

	// Create only one vehicle per point
	for (let p of points) {
		// Create vehicle with random start position but fixed target
		let vehicle = new Vehicle(
			random(width),
			random(height), // Random start position
			p.x,
			p.y // Target position is the text point
		);
		vehicles.push(vehicle);
		targetPoints.push(createVector(p.x, p.y));
	}
}

function draw() {
	// Draw directly to canvas instead of buffer
	background(240, 30, 15);

	// Draw main effects directly
	drawNebulae(1);
	drawStars(1);

	updateAndDrawComets();

	updateMainParticles(1);
	drawForceIndicator();

	time += 0.01;

	// Debug Info
	fill(0, 0, 100);
	noStroke();
	text('FPS: ' + floor(frameRate()), 10, 20);
}

function drawNebulae() {
	noStroke();

	for (let nebula of nebulae) {
		push();
		translate(nebula.x, nebula.y);
		fill(nebula.hue, 60, 80, nebula.alpha);

		beginShape();
		for (let a = 0; a < TWO_PI; a += 0.5) {
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
		// Move comet
		comet.pos.add(comet.vel);

		// Draw comet
		noStroke();

		// Draw tail (3 circles getting bigger and more transparent)
		for (let i = 3; i > 0; i--) {
			let alpha = 0.3 / i; // Gets more transparent as circles get bigger
			fill(comet.hue, 80, 100, alpha);
			ellipse(
				comet.pos.x - comet.vel.x * i * 2,
				comet.pos.y - comet.vel.y * i * 2,
				8
			);
		}

		// Draw comet head
		fill(comet.hue, 80, 100);
		ellipse(comet.pos.x, comet.pos.y, 6);

		// Remove if off screen
		if (
			comet.pos.x < 0 ||
			comet.pos.x > width ||
			comet.pos.y < 0 ||
			comet.pos.y > height
		) {
			comet.alive = false;
		}
	}

	// Keep 3 comets on screen
	comets = comets.filter((c) => c.alive);
	while (comets.length < 3) {
		createNewComet();
	}
}

function updateMainParticles(intensity) {
	for (let vehicle of vehicles) {
		vehicle.behaviors(intensity);
		vehicle.update();
		vehicle.display(intensity);
	}
}

// TODO
function drawForceIndicator() {
	noCursor();
	if (forceActive) {
		noFill();
		strokeWeight(2);
		if (attractMode) {
			stroke(120, 100, 100);
			ellipse(mouseX, mouseY, 30);
		} else {
			stroke(0, 100, 100);
			ellipse(mouseX, mouseY, 30);
		}
	}
}

// TODO explain the code
function keyPressed() {
	if (key === ' ' && !isTransitioning) {
		isTransitioning = true;

		for (let vehicle of vehicles) {
			vehicle.target = createVector(
				random([-100, width + 100]),
				random([-100, height + 100])
			);
		}

		wordIndex = (wordIndex + 1) % WORDS.length;
		generateTextPoints(WORDS[wordIndex]);
		isTransitioning = false;
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
