let nebulae = [];
let stars = [];
let comets = [];
let vehicles = [];
let targetPoints = [];
let time = 0;
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
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	colorMode(HSB, 360, 100, 100, 1.0);

	// Initialize other components
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
	for (let i = 0; i < 3; i++) {
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
    // Resets arrays for new text
    vehicles = [];
    targetPoints = [];

    // Adjusts font size based on text length
    let fontSize = text.length > 4 ? 120 : 150;
    
    // Calculates text boundaries for centering
    let bounds = font.textBounds(text, 0, 0, fontSize);
    let centerX = width / 2 - bounds.w / 2;
    let centerY = height / 2 + bounds.h / 2;

    // Converts text to points using p5.js font functions
    let points = font.textToPoints(text, centerX, centerY, fontSize, {
        sampleFactor: 0.1,  // Controls point density
        simplifyThreshold: 0
    });

    // Creates vehicles (particles) for each point
    for (let p of points) {
        // Each vehicle starts at random position but has fixed target
        let vehicle = new Vehicle(
            random(width),
            random(height),
            p.x,
            p.y
        );
        vehicles.push(vehicle);
        targetPoints.push(createVector(p.x, p.y));
    }
}

function draw() {
    // Main animation loop that runs continuously
    background(240, 30, 15);  // Sets dark background

    // Draws all visual elements in order
    drawNebulae(1);
    drawStars(1);
    updateAndDrawComets();
    updateMainParticles(1);
    drawForceIndicator();

    time += 0.01;  // Updates global time variable

    // Shows FPS counter
    showFps();
}

function drawNebulae() {
    // Creates cloud-like shapes using Perlin noise
    noStroke();

    for (let nebula of nebulae) {
        push();  // Saves current drawing state
        translate(nebula.x, nebula.y);  // Moves drawing origin to nebula center
        fill(nebula.hue, 60, 80, nebula.alpha);

        // Creates organic shape using vertices in a circle
        beginShape();
        for (let a = 0; a < TWO_PI; a += 0.5) {
            // Uses Perlin noise to create irregular radius
            let r = nebula.size * noise(cos(a) + nebula.offset, sin(a) + nebula.offset);
            let x = r * cos(a);
            let y = r * sin(a);
            vertex(x, y);
        }
        endShape(CLOSE);

        pop();  // Restores drawing state
    }
}

function drawStars() {
    // Draws simple white dots (stars) at random fixed positions
    noStroke();
    fill(0, 0, 100, 0.8);  // White color with 80% opacity

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
            let alpha = 0.3 / i;  // Decreasing opacity for tail effect
            fill(comet.hue, 80, 100, alpha);
            ellipse(
                comet.pos.x - comet.vel.x * i * 2,  // Position offset based on velocity
                comet.pos.y - comet.vel.y * i * 2,
                8
            );
        }

        // Draws the comet's head
        fill(comet.hue, 80, 100);
        ellipse(comet.pos.x, comet.pos.y, 6);

        // Marks comets as dead if they move off-screen
        if (comet.pos.x < 0 || comet.pos.x > width ||
            comet.pos.y < 0 || comet.pos.y > height) {
            comet.alive = false;
        }
    }

    // Maintains exactly 3 comets by removing dead ones and creating new ones
    comets = comets.filter((c) => c.alive);
    while (comets.length < 3) {
        createNewComet();
    }
}

function updateMainParticles(intensity) {
    // Iterates through all vehicle objects (text particles)
    for (let vehicle of vehicles) {
        vehicle.move(intensity);    // Calculates new position based on forces
        vehicle.update();          // Updates the position
        vehicle.show(intensity);   // Renders the particle on screen
    }
}

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
