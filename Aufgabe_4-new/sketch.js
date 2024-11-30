let fireworks = [];
let stars = [];
let gravity;
let autoLaunch = true;
let soundEnabled = false;
let cityscape;
let explosionSounds = [];

function preload() {
    textFont = loadFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf');
	// Load all explosion sounds
	for (let explosionURL of CONFIG.SOUNDS.EXPLOSION) {
		let sound = loadSound(explosionURL);
		sound.setVolume(0.2);
		explosionSounds.push(sound);
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB);
	gravity = createVector(0, 0.2);

	// Initialize stars
	for (let i = 0; i < CONFIG.STAR_COUNT; i++) {
		stars.push(new Star(random(width), random(height / 2)));
	}

	cityscape = createCityscape();
}

function draw() {
	colorMode(RGB);
	background(...CONFIG.COLORS.BACKGROUND, 25);

	// Draw stars
	for (let star of stars) star.show();

	// Draw cityscape
	image(cityscape, 0, height - cityscape.height);

	// Auto-launch fireworks
	if (autoLaunch && random(1) < CONFIG.LAUNCH_CHANCE) {
		launchFirework(random(width), height);
	}

	// Update cityscape every 60 frames (about 1 second)
	if (frameCount % 60 === 0) {
		cityscape = createCityscape();
	}

	// Update and show fireworks
	for (let i = fireworks.length - 1; i >= 0; i--) {
		fireworks[i].update();
		fireworks[i].show();

		if (fireworks[i].done()) {
			fireworks.splice(i, 1);
		}
	}
}

function mousePressed() {
	if (mouseY < height - 100) {
		launchFirework(mouseX, mouseY);
	}
}

function launchFirework(x, y) {
    let type = random(CONFIG.FIREWORK_TYPES);
    fireworks.push(new Firework(x, y, type));
}

function toggleAuto() {
	autoLaunch = !autoLaunch;
}

function toggleSound() {
	soundEnabled = !soundEnabled;
	// Initialize audio context with user interaction
	if (soundEnabled && getAudioContext().state !== 'running') {
		getAudioContext().resume();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	cityscape = createCityscape();
}
