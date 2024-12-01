class SteeringParticle {
    constructor(x, y, targetX, targetY, hu) {
        this.pos = createVector(x, y);
        
        this.vel = createVector(targetX - x, targetY - y);
        this.vel.normalize();
        this.vel.mult(2);
        
        this.acc = createVector();
        this.target = createVector(targetX, targetY);
        this.maxSpeed = 4;
        this.maxForce = 0.4;
        this.hu = hu;
        this.r = 3;
        this.lifespan = 255;
        this.reached = false;
        
        this.dampening = 0.98;
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
        
        if (d < 30) {
            speed = map(d, 0, 30, 0, this.maxSpeed);
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
            
            // Apply dampening
            this.vel.mult(this.dampening);
            
            this.pos.add(this.vel);
            this.acc.mult(0);
            
            // Only consider reached if very close and moving very slowly
            if (p5.Vector.dist(this.pos, this.target) < 2 && this.vel.mag() < 0.1) {
                this.reached = true;
                // Snap to final position
                this.pos = this.target.copy();
            }
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