class LightParticle {
    constructor(x, y) {
        this.radius = random(2, 5);
        this.color = colorPalette.getNeonColor();
        this.x = x || random(width);
        this.y = y || random(height);
        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.alpha = random(0.5, 1);
        this.life = 1.0;
        this.originalRadius = this.radius;
        this.isSwallowed = false;
    }

    update(audioLevel = 0, pattern = null, avoidPattern = false, blackHoleMode = false) {
        if (this.isSwallowed) return;
        let speedMultiplier = 1 + audioLevel * 2;
        
        if (pattern && (avoidPattern || blackHoleMode)) {
            let dx = width/2 - this.x;
            let dy = height/2 - this.y;
            let distance = sqrt(dx * dx + dy * dy);
            let patternRadius = pattern.radius;
            
            if (blackHoleMode) {
                if (distance < patternRadius * 1.5) {
                    let force = map(distance, 0, patternRadius * 1.5, 0.5, 0);
                    this.vx += (dx/distance) * force;
                    this.vy += (dy/distance) * force;
                    
                    if (distance < patternRadius * 0.5) {
                        this.isSwallowed = true;
                        pattern.absorbParticle(this.color);
                        return;
                    }
                }
            } else if (avoidPattern) {
                if (distance < patternRadius * 2) {
                    let repelForce = map(distance, 0, patternRadius * 2, 0.5, 0);
                    this.vx -= (dx/distance) * repelForce;
                    this.vy -= (dy/distance) * repelForce;
                }
            }
        }

        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;
        
        this.vx += random(-0.1, 0.1);
        this.vy += random(-0.1, 0.1);
        
        this.vx = constrain(this.vx, -3, 3);
        this.vy = constrain(this.vy, -3, 3);
        
        this.radius = this.originalRadius * (1 + audioLevel * 50);
        this.life *= 0.99;
        this.alpha = this.life * random(0.5, 1);
        
        if (this.x < 0 || this.x > width || 
            this.y < 0 || this.y > height || 
            this.life < 0.1) {
            this.reset();
        }
    }

    reset() {
        this.x = random(width);
        this.y = random(height);
        this.vx = random(-2, 2);
        this.vy = random(-2, 2);
        this.life = 1.0;
        this.alpha = random(0.5, 1);
        this.isSwallowed = false;
    }

    display() {
        if (this.isSwallowed) return;
        
        noStroke();
        for (let i = 3; i > 0; i--) {
            fill(hue(this.color), 
                 saturation(this.color), 
                 brightness(this.color), 
                 this.alpha / i);
            circle(this.x, this.y, this.radius * i * 2);
        }
    }
}
