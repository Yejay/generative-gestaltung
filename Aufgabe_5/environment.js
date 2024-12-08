class Environment {
    constructor() {
        this.plankton = [];
        this.bubbles = [];
        this.waterRays = [];
        this.nightMode = false;
        this.waterOffset = 0;
    }

    update() {
        this.updateBubbles();
        this.updatePlankton();
        if (!this.nightMode) {
            this.updateWaterRays();
        }
        this.waterOffset += 0.02;  // For ripple animation
    }

    draw() {
        this.drawBackground();
        this.drawWaterRipples();
        if (!this.nightMode) {
            this.drawWaterRays();
        }
        this.drawBubbles();
        this.drawPlankton();
    }

    drawBackground() {
        console.log("Drawing background, nightMode:", this.nightMode);
        let bgColor = this.nightMode ? color(20, 30, 50) : color(40, 100, 150);
        background(bgColor);
    }

    drawWaterRipples() {
        noFill();
        stroke(255, this.nightMode ? 15 : 30);
        for (let i = 0; i < height; i += 50) {
            beginShape();
            for (let x = 0; x < width; x += 10) {
                let y = i + sin(x * 0.01 + this.waterOffset) * 20;
                vertex(x, y);
            }
            endShape();
        }
    }

    drawWaterRays() {
        noStroke();
        for (let i = 0; i < width; i += 50) {
            let rayHeight = height * 0.7;
            let alpha = map(sin(frameCount * 0.02 + i * 0.01), -1, 1, 0.05, 0.15);
            fill(60, 10, 100, alpha);
            beginShape();
            vertex(i, 0);
            vertex(i + 30, 0);
            vertex(i + random(-100, 100), rayHeight);
            vertex(i + random(-100, 100), rayHeight);
            endShape(CLOSE);
        }
    }

    updateBubbles() {
        if (random(1) < CONFIG.ENVIRONMENT.BUBBLE_RATE) {
            this.bubbles.push({
                x: random(width),
                y: height,
                size: random(2, 8),
                speed: random(1, 3)
            });
            console.log("Bubble created"); // Debug log
        }
    
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            let bubble = this.bubbles[i];
            bubble.y -= bubble.speed;
            bubble.x += sin(frameCount * 0.1 + bubble.y * 0.1) * 0.5;
            if (bubble.y < 0) {
                this.bubbles.splice(i, 1);
                console.log("Bubble removed"); // Debug log
            }
        }
    }

    drawBubbles() {
        noStroke();
        fill(255, 255, 255, 0.8); // Bright white bubbles
        this.bubbles.forEach(bubble => {
            ellipse(bubble.x, bubble.y, bubble.size);
        });
    }

    updatePlankton() {
        while (this.plankton.length < CONFIG.ENVIRONMENT.PLANKTON_DENSITY) {
            this.plankton.push({
                x: random(width),
                y: random(height),
                size: random(2, 4)
            });
        }
    }
    
    drawPlankton() {
        noStroke();
        fill(50, 200, 50, this.nightMode ? 0.7 : 0.4); // Bright green plankton
        this.plankton.forEach(p => {
            let flicker = random(0.8, 1.2);
            ellipse(p.x, p.y, p.size * flicker);
        });
    }
}