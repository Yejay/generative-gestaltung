let ui;
let fish = [];
let jellyfishes = [];
let separationWeight = 1.5;
let alignmentWeight = 1.0;
let cohesionWeight = 1.0;
const GRID_SIZE = 50;
let spatialGrid = {};
if (typeof CONFIG === 'undefined') {
	console.error(
		'CONFIG is not defined! Make sure constants.js is loaded first.'
	);
}

function preload() {
	backgroundVideo = createVideo(
		// 'https://cdn.pixabay.com/video/2020/04/30/37712-414754673_large.mp4'
        'https://cdn.pixabay.com/video/2022/06/21/121463-724697477_large.mp4'
        // 'https://cdn.pixabay.com/video/2021/07/28/83061-581386110_large.mp4'
        // 'https://cdn.pixabay.com/video/2023/04/23/160210-820383082_large.mp4'
        // 'https://cdn.pixabay.com/video/2022/11/08/138218-768820241_large.mp4'
        // 'https://cdn.pixabay.com/video/2022/06/21/121613-724710344_large.mp4'
	);
	backgroundVideo.hide(); // Hide the original HTML element
	// Add an event listener to play the video when it's loaded
	backgroundVideo.onended(() => {
		backgroundVideo.loop(); // Loop the video when it ends
	});
	backgroundVideo.volume(0); // Mute the video
	backgroundVideo.play(); // Start playing the video

	predatorImages = [
		loadImage(
			'https://img.icons8.com/?size=100&id=dNyJV4Qw3AEk&format=png&color=000000'
		),
	];
	preyImages = [
		loadImage(
			'https://img.icons8.com/?size=100&id=ridRyeBSIgrH&format=png&color=000000'
		),
	];
	jellyfishImages = [
		loadImage(
			// 'https://img.icons8.com/?size=100&id=ywdnn5QiqsYg&format=png&color=000000'
            'https://img.icons8.com/?size=100&id=YUXV7WxntwIX&format=png&color=000000'
		),
	];
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	backgroundVideo.loop();
	backgroundVideo.volume(0); // Mute the video
	// environment = new Environment();

	ui = new UI({
		onSeparationWeightChange: (value) => (separationWeight = value),
		onAlignmentWeightChange: (value) => (alignmentWeight = value),
		onCohesionWeightChange: (value) => (cohesionWeight = value),
		onAddFish: () => addNewFish(false),
		onAddShark: () => addNewFish(true),
		onAddJellyfish: addJellyfish,
		onReset: resetSimulation,
	});

	initializeSimulation();
}

function initializeSimulation() {
	// Initialize with fish
	for (let i = 0; i < CONFIG.FISH.INITIAL_PREY_COUNT; i++) {
		fish.push(new Fish(false));
	}

	// Initialize with sharks
	for (let i = 0; i < CONFIG.FISH.INITIAL_SHARK_COUNT; i++) {
		fish.push(new Fish(true));
	}

	// Initialize with jellyfish
	for (let i = 0; i < CONFIG.JELLYFISH.COUNT; i++) {
		jellyfishes.push(new Jellyfish());
	}
}

function draw() {
	try {
		image(backgroundVideo, 0, 0, width, height);
		// Draw jellyfishes
		jellyfishes.forEach((jelly, index) => {
			if (!jelly || typeof jelly.draw !== 'function') {
				console.error(`Jellyfish at index ${index} is invalid:`, jelly);
			} else {
				jelly.update();
				jelly.draw();
			}
		});

		// Draw fish
		fish.forEach((f, index) => {
			if (!f || typeof f.draw !== 'function') {
				console.error(`Fish at index ${index} is invalid:`, f);
			} else {
				f.update(fish, jellyfishes);
				f.draw();
			}
		});

		// Update stats in the UI
		ui.updateStats({
			fishCount: fish.filter((f) => !f.isShark).length,
			sharkCount: fish.filter((f) => f.isShark).length,
			jellyfishCount: jellyfishes.length,
		});
	} catch (error) {
		console.error('Error in draw():', error);
		noLoop();
	}
}

function addNewFish(isShark) {
	let newFish = new Fish(isShark);
	newFish.pos = createVector(mouseX, mouseY);
	fish.push(newFish);
	soundManager.playSound('splash');
}

function updateFishSpeed(value) {
	console.log('Fish speed slider value:', value); // Debugging
	fish.forEach((f) => {
		if (!f.isShark) {
			f.maxSpeed = value; // Update speed for non-sharks
			console.log('Updated fish maxSpeed:', f.maxSpeed); // Debugging
		}
	});
}

function updateSharkSpeed(value) {
	fish.forEach((f) => {
		if (f.isShark) {
			f.maxSpeed = value;
		}
	});
}

function addJellyfish() {
	let jelly = new Jellyfish();
	jelly.pos = createVector(mouseX, mouseY);
	jellyfishes.push(jelly);
	soundManager.playSound('bubble');
}

function resetSimulation() {
	fish = [];
	jellyfishes = [];
	initializeSimulation();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
	artisticBg.addRipple(mouseX, mouseY);
	if (mouseX < 200 && mouseY < 300) return;
	if (mouseButton === LEFT) addNewFish(false);
	if (mouseButton === RIGHT) addNewFish(true);
}

function keyPressed() {
	switch (key) {
		case 'f':
			addNewFish(false);
			break;
		case 's':
			addNewFish(true);
			break;
		case 'j':
			addJellyfish();
			break;
		case 'r':
			resetSimulation();
			break;
	}
}

function updateSpatialGrid() {
	spatialGrid = {};
	for (let f of fish) {
		let gridX = floor(f.pos.x / GRID_SIZE);
		let gridY = floor(f.pos.y / GRID_SIZE);
		let key = `${gridX},${gridY}`;
		if (!spatialGrid[key]) spatialGrid[key] = [];
		spatialGrid[key].push(f);
	}
}
