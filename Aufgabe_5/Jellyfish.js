class Jellyfish {
    constructor() {
        this.pos = createVector(random(width), random(height));
        this.vel = p5.Vector.random2D();
        this.acc = createVector();
        this.size = random(CONFIG.JELLYFISH.MIN_SIZE, CONFIG.JELLYFISH.MAX_SIZE);
        this.phase = random(TWO_PI);
        this.image = random(jellyfishImages); // Randomly select an image
    }

    update() {
        // Random drift movement using Perlin noise
        let noise1 = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01);
        let noise2 = noise(this.pos.x * 0.01, this.pos.y * 0.01, frameCount * 0.01 + 1000);
        
        this.vel.x = map(noise1, 0, 1, -CONFIG.JELLYFISH.SPEED, CONFIG.JELLYFISH.SPEED);
        this.vel.y = map(noise2, 0, 1, -CONFIG.JELLYFISH.SPEED, CONFIG.JELLYFISH.SPEED);
        
        this.pos.add(this.vel);
        this.edges(); // Handle edge behavior

        // Update phase for pulsing animation
        this.phase += CONFIG.JELLYFISH.PULSE_RATE;
    }

    draw(isNightMode) {
        push();
        translate(this.pos.x, this.pos.y);

        // Add glow in night mode
        if (isNightMode) {
            drawingContext.shadowBlur = 30;
            drawingContext.shadowColor = 'cyan';
        }

        // Draw the image scaled to the size
        imageMode(CENTER);
        image(this.image, 0, 0, this.size, this.size);

        pop();
    }

    edges() {
        if (this.pos.x < this.size / 2 || this.pos.x > width - this.size / 2) {
            this.vel.x *= -1; // Reverse horizontal velocity
            this.pos.x = constrain(this.pos.x, this.size / 2, width - this.size / 2);
        }
        if (this.pos.y < this.size / 2 || this.pos.y > height - this.size / 2) {
            this.vel.y *= -1; // Reverse vertical velocity
            this.pos.y = constrain(this.pos.y, this.size / 2, height - this.size / 2);
        }
    }
}
