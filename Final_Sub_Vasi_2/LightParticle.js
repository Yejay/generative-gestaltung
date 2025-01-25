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
    }

    update(audioLevel = 0) {
        // Update position with audio-reactive speed
        let speedMultiplier = 1 + audioLevel * 2;
        this.x += this.vx * speedMultiplier;
        this.y += this.vy * speedMultiplier;
        
        // Add slight movement variation
        this.vx += random(-0.1, 0.1);
        this.vy += random(-0.1, 0.1);
        
        // Constrain velocity
        this.vx = constrain(this.vx, -3, 3);
        this.vy = constrain(this.vy, -3, 3);
        
        // Update radius based on audio level
        this.radius = this.originalRadius * (1 + audioLevel * 50);
        
        // Decrease life and alpha
        this.life *= 0.99;
        this.alpha = this.life * random(0.5, 1);
        
        // Reset if out of bounds or dead
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
    }

    display() {
        // Create glowing effect
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