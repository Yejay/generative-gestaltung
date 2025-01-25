class SymmetricalPattern {
    constructor() {
        this.points = [];
        this.numPoints = 8;
        this.angle = 0;
        this.radius = min(width, height) * 0.3;
        this.isCyberpunkMode = true;
        this.rotationSpeed = 0.01;
        this.lineWeight = 1;
        this.blackHoleMode = false;
        this.absorbedEnergy = 0;
        this.maxEnergy = 100;
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
                brightness: this.blackHoleMode ? 0.1 : random(0.5, 1)
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

    absorbParticle(particleColor) {
        this.absorbedEnergy = min(this.absorbedEnergy + 1, this.maxEnergy);
        
        if (this.blackHoleMode) {
            let energyRatio = this.absorbedEnergy / this.maxEnergy;
            this.points.forEach(point => {
                point.brightness = map(energyRatio, 0, 1, 0.1, 1);
            });
        }
    }

    update() {
        this.angle += this.rotationSpeed;
        
        if (!this.blackHoleMode) {
            for (let point of this.points) {
                point.brightness = map(sin(frameCount * 0.05 + this.points.indexOf(point)), -1, 1, 0.5, 1);
            }
        }
    }

    display() {
        push();
        translate(width / 2, height / 2);
        rotate(this.angle);
        
        if (this.blackHoleMode) {
            noStroke();
            fill(0, 0, 0, 0.9);
            circle(0, 0, this.radius * 1.5);
            
            let energyRatio = this.absorbedEnergy / this.maxEnergy;
            let glowColor = colorPalette.getPatternColor();
            for (let i = 5; i > 0; i--) {
                fill(hue(glowColor), 
                     saturation(glowColor), 
                     brightness(glowColor), 
                     energyRatio * 0.15 / i);
                circle(0, 0, this.radius * (1.5 + i * 0.3));
            }
        }
        
        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                let p1 = this.points[i];
                let p2 = this.points[j];
                let d = dist(p1.x, p1.y, p2.x, p2.y);
                let lineColor = colorPalette.getPatternColor();
                let energyRatio = this.blackHoleMode ? this.absorbedEnergy / this.maxEnergy : 0;
                
                if (this.blackHoleMode) {
                    let alpha = map(d, 0, this.radius * 2, 0.9, 0.2) * energyRatio;
                    
                    stroke(hue(lineColor), 
                           saturation(lineColor), 
                           brightness(lineColor) * (p1.brightness + p2.brightness) / 2, 
                           alpha);
                    strokeWeight(this.lineWeight + 2);
                    line(p1.x, p1.y, p2.x, p2.y);
                    
                    for (let g = 3; g > 0; g--) {
                        stroke(hue(lineColor), 
                               saturation(lineColor), 
                               brightness(lineColor), 
                               alpha / (g * 2));
                        strokeWeight(this.lineWeight + 2 + g * 2);
                        line(p1.x, p1.y, p2.x, p2.y);
                    }
                } else {
                    let alpha = map(d, 0, this.radius * 2, 0.8, 0.1);
                    stroke(hue(lineColor), 
                           saturation(lineColor), 
                           brightness(lineColor) * (p1.brightness + p2.brightness) / 2, 
                           alpha);
                    strokeWeight(this.lineWeight);
                    line(p1.x, p1.y, p2.x, p2.y);
                }
            }
        }
        
        for (let point of this.points) {
            let pointColor = colorPalette.getPatternColor();
            
            if (this.blackHoleMode) {
                let energyRatio = this.absorbedEnergy / this.maxEnergy;
                for (let g = 4; g > 0; g--) {
                    fill(hue(pointColor), 
                         saturation(pointColor), 
                         brightness(pointColor) * point.brightness,
                         0.3 * energyRatio / g);
                    noStroke();
                    circle(point.x, point.y, 8 + g * 4);
                }
            }
            
            fill(hue(pointColor), 
                 saturation(pointColor), 
                 brightness(pointColor) * point.brightness);
            noStroke();
            circle(point.x, point.y, this.blackHoleMode ? 6 : 5);
        }
        
        pop();
    }

    toggleBlackHoleMode() {
        this.blackHoleMode = !this.blackHoleMode;
        if (this.blackHoleMode) {
            this.absorbedEnergy = 0;
            this.points.forEach(point => point.brightness = 0.1);
        } else {
            this.generatePoints();
        }
    }

    resize() {
        this.radius = min(width, height) * 0.3;
        this.generatePoints();
    }
}
