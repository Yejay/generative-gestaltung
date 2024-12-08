class BloodParticle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 3));
        this.acc = createVector(0, 0.1);
        this.lifespan = 255;
    }

    update() {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.lifespan -= 5;
    }

    draw() {
        noStroke();
        fill(255, 0, 0, this.lifespan);
        ellipse(this.pos.x, this.pos.y, 5);
    }

    isDead() {
        return this.lifespan <= 0;
    }
}

class BloodSystem {
    constructor(x, y) {
        this.particles = [];
        this.origin = createVector(x, y);
    }

    addParticle() {
        for (let i = 0; i < 10; i++) {
            this.particles.push(new BloodParticle(this.origin.x, this.origin.y));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        this.particles.forEach(particle => particle.draw());
    }
}
