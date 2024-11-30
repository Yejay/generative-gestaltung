class SteeringParticle {
    constructor(x, y, targetX, targetY, hu) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D();
        this.vel.mult(random(2, 8));
        this.acc = createVector();
        this.target = createVector(targetX, targetY);
        this.maxSpeed = 5;
        this.maxForce = 0.3;
        this.hu = hu;
        this.r = 3;
        this.lifespan = 255;
        this.reached = false;
    }

    behaviors() {
        let arrive = this.arrive(this.target);
        this.applyForce(arrive);
    }

    applyForce(f) {
        this.acc.add(f);
    }

    arrive(target) {
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();
        let speed = this.maxSpeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxSpeed);
        }
        desired.setMag(speed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    update() {
        if (!this.reached) {
            this.behaviors();
            this.vel.add(this.acc);
            this.vel.limit(this.maxSpeed);
            this.pos.add(this.vel);
            this.acc.mult(0);
        }
        
        if (p5.Vector.dist(this.pos, this.target) < 5) {
            this.reached = true;
        }
        
        this.lifespan -= 1;
    }

    show() {
        colorMode(HSB);
        strokeWeight(this.r);
        stroke(this.hu, 255, 255, this.lifespan);
        point(this.pos.x, this.pos.y);
    }

    done() {
        return this.lifespan < 0;
    }
}