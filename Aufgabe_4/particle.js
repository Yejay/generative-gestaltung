// particle.js
const PARTICLE_SIZE = 0.2; // Ändere diesen Wert, um die Partikelgröße zu skalieren (z. B. 0.5 für kleinere, 2 für größere)

class Particle {
    constructor(x, y, hu, firework, shape = "heart") {
        this.pos = createVector(x, y);
        this.firework = firework;
        this.lifespan = 255;
        this.hu = hu;
        this.acc = createVector(0, 0);
        this.shape = shape;

        this.sinOffset = random(PI); // Offset für hochfrequenten Sinus
        this.sinAmplitude = random(2, 6);
        this.sinFrequency = random(0.2, 0.5);

        if (this.firework) {
            this.vel = createVector(0, random(-12, -8));
            this.curve = createVector(random(-3, 3), random(-3, -5)); // Kurvenversatz
        } else {
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (this.firework) {
            this.pos.x += this.curve.x + this.sinAmplitude * sin(this.sinOffset + frameCount * this.sinFrequency);
            this.pos.y += this.curve.y;
        } else {
            this.vel.mult(0.9);
            this.lifespan -= 4;
        }

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    done() {
        return this.lifespan < 0;
    }

    show() {
        colorMode(HSB);

        if (this.shape === "heart") {
            // Zeichne Herzform
            push();
            translate(this.pos.x, this.pos.y);
            stroke(this.hu, 255, 255);
            fill(this.hu, 255, 255, this.lifespan);
            beginShape();
            vertex(0, -5 * PARTICLE_SIZE);
            bezierVertex(
                -7 * PARTICLE_SIZE, -15 * PARTICLE_SIZE, 
                -15 * PARTICLE_SIZE, 5 * PARTICLE_SIZE, 
                0, 15 * PARTICLE_SIZE
            );
            bezierVertex(
                15 * PARTICLE_SIZE, 5 * PARTICLE_SIZE, 
                7 * PARTICLE_SIZE, -15 * PARTICLE_SIZE, 
                0, -5 * PARTICLE_SIZE
            );
            endShape(CLOSE);
            pop();
        } else {
            // Zeichne Punkt
            strokeWeight(2 * PARTICLE_SIZE);
            stroke(this.hu, 255, 255, this.lifespan);
            point(this.pos.x, this.pos.y);
        }
    }
}
