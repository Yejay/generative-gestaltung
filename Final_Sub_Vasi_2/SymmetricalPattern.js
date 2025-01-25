class SymmetricalPattern {
    constructor() {
        this.points = [];
        this.numPoints = 8;
        this.angle = 0;
        this.radius = min(width, height) * 0.3;
        this.isCyberpunkMode = true;
        this.rotationSpeed = 0.01;
        this.lineWeight = 1;
        this.generatePoints();
    }

    generatePoints() {
        this.points = [];
        for (let i = 0; i < this.numPoints; i++) {
            let angle = TWO_PI * i / this.numPoints;
            let x = cos(angle) * this.radius;
            let y = sin(angle) * this.radius;
            this.points.push({ 
                x, 
                y,
                brightness: random(0.5, 1)
            });
        }
    }

    toggleMode() {
        this.isCyberpunkMode = !this.isCyberpunkMode;
        if (this.isCyberpunkMode) {
            this.numPoints = 8;
            this.rotationSpeed = 0.01;
            this.lineWeight = 1;
        } else {
            // Wes Anderson mode: more structured, slower movement
            this.numPoints = 12;
            this.rotationSpeed = 0.005;
            this.lineWeight = 2;
        }
        this.generatePoints();
    }

    randomize() {
        this.numPoints = floor(random(6, 16));
        this.radius = min(width, height) * random(0.2, 0.4);
        this.rotationSpeed = random(0.005, 0.015);
        this.generatePoints();
    }

    update() {
        this.angle += this.rotationSpeed;
        
        // Update point brightness with slight oscillation
        for (let point of this.points) {
            point.brightness = map(sin(frameCount * 0.05 + this.points.indexOf(point)), -1, 1, 0.5, 1);
        }
    }

    display() {
        push();
        translate(width / 2, height / 2);
        rotate(this.angle);
        
        // Draw connections between points
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                let p1 = this.points[i];
                let p2 = this.points[j];
                
                // Calculate distance for line opacity
                let d = dist(p1.x, p1.y, p2.x, p2.y);
                let alpha = map(d, 0, this.radius * 2, 0.8, 0.1);
                
                let lineColor = this.isCyberpunkMode ? 
                    colorPalette.getPatternColor() : 
                    colorPalette.getPastelColor();
                
                stroke(hue(lineColor), 
                       saturation(lineColor), 
                       brightness(lineColor) * (p1.brightness + p2.brightness) / 2, 
                       alpha);
                strokeWeight(this.lineWeight);
                line(p1.x, p1.y, p2.x, p2.y);
            }
        }
        
        // Draw points
        for (let point of this.points) {
            let pointColor = this.isCyberpunkMode ? 
                colorPalette.getAccentColor() : 
                colorPalette.getPastelColor();
            
            fill(hue(pointColor), 
                 saturation(pointColor), 
                 brightness(pointColor) * point.brightness);
            noStroke();
            circle(point.x, point.y, 5);
        }
        
        pop();
    }

    resize() {
        this.radius = min(width, height) * 0.3;
        this.generatePoints();
    }
}
