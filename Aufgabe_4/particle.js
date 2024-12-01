class Particle {
    constructor(x, y, hu, firework, type = 'circle') {
        this.reset(x, y, hu, firework, type);
    }
    
    reset(x, y, hu, firework, type = 'circle') {
        this.pos = createVector(x, y);
        this.firework = firework;
        this.lifespan = 255;
        this.hu = hu;
        this.type = type;
        this.acc = createVector(0, 0);
        this.trail = [];
        
        if (firework) {
            const angle = random(-PI/6, PI/6);
            this.vel = p5.Vector.fromAngle(angle - HALF_PI)
                .mult(random(CONFIG.PARTICLE.LAUNCH_VELOCITY.MIN, 
                           CONFIG.PARTICLE.LAUNCH_VELOCITY.MAX));
        } else {
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
        return this;
    }
    
    applyForce(force) {
        this.acc.add(force);
    }
    
    update() {
        if (!this.firework) {
            this.vel.mult(CONFIG.PARTICLE.VELOCITY_RETAIN);
            this.lifespan -= CONFIG.PARTICLE.LIFESPAN_DECREASE;
            
            if (this.trail.length < CONFIG.PARTICLE.TRAIL_LENGTH) {
                this.trail.push(this.pos.copy());
            } else {
                this.trail.shift();
                this.trail.push(this.pos.copy());
            }
        }
        
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }
    
    show() {
        colorMode(HSB);
        
        if (!this.firework) {
            this.drawTrail();
            this.drawParticle();
        } else {
            strokeWeight(4);
            stroke(this.hu, 255, 255);
            point(this.pos.x, this.pos.y);
        }
    }
    
    drawTrail() {
        for (let i = 0; i < this.trail.length - 1; i++) {
            const alpha = map(i, 0, this.trail.length - 1, 0, this.lifespan);
            stroke(this.hu, 255, 255, alpha);
            line(this.trail[i].x, this.trail[i].y, 
                 this.trail[i + 1].x, this.trail[i + 1].y);
        }
    }
    
    drawParticle() {
        strokeWeight(2);
        stroke(this.hu, 255, 255, this.lifespan);
        
        switch(this.type) {
            case 'heart':
                this.drawHeart();
                break;
            case 'text':
                this.drawText();
                break;
            case 'spiral':
                this.drawSpiral();
                break;
            default:
                point(this.pos.x, this.pos.y);
        }
    }
    
    drawHeart() {
        push();
        translate(this.pos.x, this.pos.y);
        scale(0.3);
        beginShape();
        vertex(0, -5);
        bezierVertex(-5, -5, -5, 0, 0, 5);
        bezierVertex(5, 0, 5, -5, 0, -5);
        endShape(CLOSE);
        pop();
    }
    
    drawText() {
        textSize(40);
        textAlign(CENTER, CENTER);
        text(random(CONFIG.TEXTS), this.pos.x, this.pos.y);
    }
    
    drawSpiral() {
        const angle = frameCount * 0.1;
        const radius = 5;
        const x = this.pos.x + cos(angle) * radius;
        const y = this.pos.y + sin(angle) * radius;
        point(x, y);
    }
    
    done() {
        return this.lifespan < 0;
    }
}