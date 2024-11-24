const fireworks = [];
const buildings = [];
const stars = [];
let gravity;
let lastLightToggle = 0;
let lastStarBlink = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB);
    gravity = createVector(0, 0.2);
    stroke(255);
    strokeWeight(4);
    background(0);

    // Generate buildings
    const buildingWidth = width / 6;
    for (let i = 0; i < 6; i++) {
        const x = i * buildingWidth + random(0, buildingWidth / 4);
        const w = random(buildingWidth / 2, buildingWidth * 0.8);
        const h = random(height / 4, height / 2);
        buildings.push(new Building(x, height - h, w, h));
    }

    // Generate stars
    for (let i = 0; i < 100; i++) {
        stars.push(new Star(random(width), random(height / 2), random(1, 3)));
    }
}

function draw() {
    colorMode(RGB);
    background(5, 10, 30, 25); // Darker black-blue shade

    // Draw stars
    for (let star of stars) {
        star.show();
    }

    // Blink stars every 3 seconds
    if (millis() - lastStarBlink > 3000) {
        for (let i = 0; i < random(1, 3); i++) {
            const star = random(stars);
            star.blink();
            setTimeout(() => star.blink(), 1500); // Second blink
        }
        lastStarBlink = millis();
    }

    // Toggle building lights every 4 seconds
    if (millis() - lastLightToggle > 4000) {
        for (let building of buildings) {
            building.toggleRandomLights(2 + floor(random(2))); // 2 to 3 lights
        }
        lastLightToggle = millis();
    }

    // Draw and update buildings
    for (let building of buildings) {
        building.show();
    }

    // Randomly launch fireworks
    if (random(1) < 0.04) {
        const building = random(buildings);
        const edge = random(["top", "bottom"]);
        let x, y;

        if (edge === "top") {
            x = building.x + random(0, building.w);
            y = building.y;
        } else {
            x = building.x + random(0, building.w);
            y = height;
        }

        fireworks.push(new Firework(x, y, "foreground"));
    }

    // Update and display fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();

        if (fireworks[i].done()) {
            fireworks.splice(i, 1);
        }
    }
}

// Building class
class Building {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.windowSize = 10;
        this.windowPadding = 5;
        this.lights = [];
        this.initializeLights();
    }

    initializeLights() {
        const rows = Math.floor((this.h - this.windowPadding) / (this.windowSize + this.windowPadding));
        const cols = Math.floor((this.w - this.windowPadding) / (this.windowSize + this.windowPadding));
        for (let i = 0; i < rows; i++) {
            this.lights[i] = [];
            for (let j = 0; j < cols; j++) {
                this.lights[i][j] = random() < 0.5;
            }
        }
    }

    toggleRandomLights(max) {
        let toggled = 0;
        while (toggled < max) {
            const i = floor(random(this.lights.length));
            const j = floor(random(this.lights[i].length));
            this.lights[i][j] = !this.lights[i][j];
            toggled++;
        }
    }

    show() {
        fill(50);
        noStroke();
        rect(this.x, this.y, this.w, this.h);

        for (let i = 0; i < this.lights.length; i++) {
            for (let j = 0; j < this.lights[i].length; j++) {
                const lightOn = this.lights[i][j];
                const x = this.x + j * (this.windowSize + this.windowPadding) + this.windowPadding;
                const y = this.y + i * (this.windowSize + this.windowPadding) + this.windowPadding;
                fill(lightOn ? color(255, 204, 0) : color(30));
                rect(x, y, this.windowSize, this.windowSize);
            }
        }
    }
}

// Star class
class Star {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.blinking = false;
        this.blinkTimer = 0;
    }

    blink() {
        this.blinking = true;
        this.blinkTimer = millis();
    }

    show() {
        fill(255);
        noStroke();

        if (this.blinking) {
            const elapsed = millis() - this.blinkTimer;
            if (elapsed > 500) {
                this.blinking = false;
            } else {
                fill(255, 255 - (elapsed / 500) * 255);
            }
        }

        ellipse(this.x, this.y, this.size, this.size);
    }
}
