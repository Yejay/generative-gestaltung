class BloodSystem {
    constructor(x, y) {
        this.particles = [];
        this.origin = createVector(x, y);
    }

    addParticle() {
        for (let i = 0; i < 10; i++) { // Generate multiple particles at once
            this.particles.push(new BloodParticle(this.origin.x, this.origin.y));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1); // Remove dead particles
            }
        }
    }

    draw() {
        this.particles.forEach(particle => particle.draw());
    }
}
