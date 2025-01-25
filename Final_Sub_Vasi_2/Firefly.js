class Firefly {
    constructor(x, y) {
        this.position = createVector(x, y);
        this.velocity = p5.Vector.random2D().mult(random(0.5, 1));
        this.acceleration = createVector(0, 0);
        this.maxSpeed = 2; 
        this.maxForce = 0.1; 
        this.glowSize = random(10, 20);
        this.blendFactor = 0; 
    }

    applyForce(force) {
        this.acceleration.add(force);
    }

    wander() {
        let wanderForce = p5.Vector.random2D().mult(0.2);
        this.applyForce(wanderForce);
    }

    chase(target) {
        let desired = p5.Vector.sub(target, this.position);
        desired.setMag(this.maxSpeed);

        let steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxForce);

        this.applyForce(steer);
    }

    update(mousePos, mouseMoved) {
        if (mouseMoved) {
            this.blendFactor = lerp(this.blendFactor, 1, 0.1); // Increase blend factor
        } else {
            this.blendFactor = lerp(this.blendFactor, 0, 0.01); // Gradually fade back to wandering
        }

        let wanderForce = p5.Vector.random2D().mult(0.2 * (1 - this.blendFactor));
        let chaseForce = p5.Vector.sub(mousePos, this.position).normalize().mult(this.blendFactor);

        this.applyForce(wanderForce);
        this.applyForce(chaseForce);

        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    display() {
        // Draw the glowing effect
        push();
        noStroke();
        for (let i = 3; i > 0; i--) {
            fill(60, 80, 95, 0.1 / i);
            ellipse(this.position.x, this.position.y, this.glowSize * i, this.glowSize * i);
        }

        // Core of the firefly
        fill(60, 100, 95);
        ellipse(this.position.x, this.position.y, this.glowSize * 0.5);
        pop();
    }
}
