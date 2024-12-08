class BloodParticle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 3));
        this.acc = createVector(0, 0.1); // Gravity-like effect
        this.lifespan = 255; // Particle lifespan
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.lifespan -= 5; // Fade out over time
    }

    draw() {
        noStroke();
        fill(255, 0, 0, this.lifespan); // Red color with alpha for fading
        ellipse(this.pos.x, this.pos.y, 5); // Small blood droplet
    }

    isDead() {
        return this.lifespan <= 0;
    }
}
