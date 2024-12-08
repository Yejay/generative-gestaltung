let environment;
let soundManager;
let ui;
let fish = [];
let jellyfishes = [];

if (typeof CONFIG === 'undefined') {
    console.error('CONFIG is not defined! Make sure constants.js is loaded first.');
}

function preload() {
    soundManager = new SoundManager();
    soundManager.preload();
    predatorImages = [
        loadImage('https://img.icons8.com/?size=100&id=Mu5PQGY9pIVj&format=png&color=000000'),
    ]
    preyImages = [
        loadImage('https://img.icons8.com/?size=100&id=ridRyeBSIgrH&format=png&color=000000'),
    ]
    jellyfishImages = [
        loadImage('https://img.icons8.com/?size=100&id=9uU0ujsukNR5&format=png&color=000000'),
    ]
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    environment = new Environment();
    console.log(environment);
    ui = new UI({
        onFishSpeedChange: updateFishSpeed,
        onSharkSpeedChange: updateSharkSpeed,
        onVolumeChange: (vol) => soundManager.setVolume(vol),
        onAddFish: () => addNewFish(false),
        onAddShark: () => addNewFish(true),
        onAddJellyfish: addJellyfish,
        onNightModeToggle: toggleNightMode,
        onReset: resetSimulation
    });
    initializeSimulation();
    soundManager.startAmbient();
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
        let bgColor = environment.nightMode ? color(20, 30, 50) : color(40, 100, 150);
        background(bgColor);

        environment.draw();

        // Draw jellyfishes
        jellyfishes.forEach((jelly, index) => {
            if (!jelly || typeof jelly.draw !== 'function') {
                console.error(`Jellyfish at index ${index} is invalid:`, jelly);
            } else {
                jelly.update();
                jelly.draw(environment.nightMode);
            }
        });

        // Draw fish
        fish.forEach((f, index) => {
            if (!f || typeof f.draw !== 'function') {
                console.error(`Fish at index ${index} is invalid:`, f);
            } else {
                f.update(fish, jellyfishes);
                f.draw(environment.nightMode);
            }
        });

        // Update stats in the UI
        ui.updateStats({
            fishCount: fish.filter(f => !f.isShark).length,
            sharkCount: fish.filter(f => f.isShark).length,
            jellyfishCount: jellyfishes.length
        });

    } catch (error) {
        console.error("Error in draw():", error);
        noLoop();
    }
}


function addNewFish(isShark) {
    let newFish = new Fish(isShark);
    newFish.pos = createVector(mouseX, mouseY);
    fish.push(newFish);
    soundManager.playSound('splash');
}

function updateFishSpeeds() {
    fish.forEach(f => {
        if (f.isShark) {
            f.maxSpeed = CONFIG.FISH.DEFAULT_SHARK_SPEED;
        } else {
            f.maxSpeed = CONFIG.FISH.DEFAULT_PREY_SPEED;
        }
    });
}

function updateFishSpeed(value) {
    fish.forEach(f => {
        if (!f.isShark) {
            f.maxSpeed = value;
        }
    });
}

function updateSharkSpeed(value) {
    fish.forEach(f => {
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

function toggleNightMode() {
    environment.nightMode = !environment.nightMode;
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
    if (mouseX < 200 && mouseY < 300) return; // Ignore UI area
    if (mouseButton === LEFT) addNewFish(false);
    if (mouseButton === RIGHT) addNewFish(true);
}

function keyPressed() {
    switch (key) {
        case 'f': addNewFish(false); break;
        case 's': addNewFish(true); break;
        case 'j': addJellyfish(); break;
        case 'n': toggleNightMode(); break;
        case 'r': resetSimulation(); break;
    }
}