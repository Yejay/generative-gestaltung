let mouseLastX = 0;
let mouseLastY = 0;
let mouseMovedRecently = false;

class WesScene {
    constructor() {
        this.windows = [];
        this.fireflies = []; // Array to store fireflies
        this.buildingWidth = width * 0.8;
        this.buildingHeight = height * 0.8; 
        this.buildingX = width/2;
        this.buildingY = height/2;
        this.lightsOn = false;
        for (let i = 0; i < 20; i++) {
            this.fireflies.push(new Firefly(random(width), random(height)));
        }
        this.initializeElements();
    }

    initializeElements() {
        this.windows = [];
        
        const windowWidth = this.buildingWidth * 0.15; 
        const windowHeight = this.buildingHeight * 0.18;
        const spacingX = windowWidth * 1.3;

        // Top floor (4 windows)
        const topRowY = this.buildingY - this.buildingHeight * 0.35;
        const startX = this.buildingX - (spacingX * 1.5);
        
        for (let i = 0; i < 4; i++) {
            this.windows.push({
                x: startX + (spacingX * i),
                y: topRowY,
                width: windowWidth,
                height: windowHeight,
                curtainHeight: 0,
                targetCurtainHeight: windowHeight,
                color: color(35, 70, 95),
                offset: random(TWO_PI),
                isLightOn: false  // Add this
            });
        }

        // Middle floor (4 windows)
        const middleRowY = this.buildingY - this.buildingHeight * 0.05;
        for (let i = 0; i < 4; i++) {
            this.windows.push({
                x: startX + (spacingX * i),
                y: middleRowY,
                width: windowWidth,
                height: windowHeight,
                curtainHeight: 0,
                targetCurtainHeight: windowHeight,
                color: color(35, 70, 95),
                offset: random(TWO_PI)
            });
        }

        // Ground floor (2 windows)
        const bottomRowY = this.buildingY + this.buildingHeight * 0.25;
        const sideWindowOffset = this.buildingWidth * 0.3;
        
        // Left window
        this.windows.push({
            x: this.buildingX - sideWindowOffset,
            y: bottomRowY,
            width: windowWidth,
            height: windowHeight,
            curtainHeight: 0,
            targetCurtainHeight: windowHeight,
            color: color(35, 70, 95),
            offset: random(TWO_PI)
        });

        // Right window
        this.windows.push({
            x: this.buildingX + sideWindowOffset,
            y: bottomRowY,
            width: windowWidth,
            height: windowHeight,
            curtainHeight: 0,
            targetCurtainHeight: windowHeight,
            color: color(35, 70, 95),
            offset: random(TWO_PI)
        });
    }

    drawBuilding() {
        push();
        rectMode(CENTER);
        
        // Main building
        fill(350, 15, 95);
        noStroke();
        rect(this.buildingX, this.buildingY, this.buildingWidth, this.buildingHeight);

        // Door frame - positioned at bottom
        const doorWidth = this.buildingWidth * 0.15;
        const doorHeight = this.buildingHeight * 0.25;
        const doorY = this.buildingY + this.buildingHeight/2 - doorHeight/2; // Aligned to bottom
        fill(35, 30, 85);
        rect(this.buildingX, doorY, doorWidth, doorHeight);

        // Door details
        stroke(35, 30, 90);
        strokeWeight(2);
        line(this.buildingX - doorWidth * 0.25, doorY - doorHeight/2, 
             this.buildingX - doorWidth * 0.25, doorY + doorHeight/2);
        line(this.buildingX + doorWidth * 0.25, doorY - doorHeight/2, 
             this.buildingX + doorWidth * 0.25, doorY + doorHeight/2);
        
        const lightFixtureY = doorY - doorHeight / 2 - 20;
        const lightFixtureWidth = doorWidth * 0.5;
        const lightFixtureHeight = 10;
         
        fill(60, 80, 80); // Light fixture color
        rect(this.buildingX, lightFixtureY, lightFixtureWidth, lightFixtureHeight, 5);


        // Decorative vertical lines
        const lineSpacing = this.buildingWidth / 12;
        for (let x = -5; x <= 5; x++) {
            let lineX = this.buildingX + (x * lineSpacing);
            let yOffset = sin(frameCount * 0.02 + x) * 3;
            line(lineX, this.buildingY - this.buildingHeight/2 + yOffset,
                 lineX, this.buildingY + this.buildingHeight/2 + yOffset);
        }
        pop();
    }

    drawStreetLights() {
        if (!this.lightsOn) return;

        const lightStartX = this.buildingWidth / 2;
        const lightStartY = -this.buildingHeight / 2;

        [1, -1].forEach(side => {
            this.drawStreetLight(this.buildingX + side * lightStartX, this.buildingY + lightStartY);
        });
    }

    drawStreetLight(x, y) {
        push();
        translate(x, y);
        stroke(35, 30, 90);
        strokeWeight(3);
        fill(60, 80, 80);
        rect(-10, 0, 20, 10);
        noStroke();
        for (let i = 0; i < 5; i++) {
            fill(60, 80, 95, 0.1 - i * 0.02);
            beginShape();
            vertex(-10, 0);
            vertex(10, 0);
            vertex(150, this.buildingHeight);
            vertex(-150, this.buildingHeight);
            endShape(CLOSE);
        }
        pop();
    }
    
    update(audioLevel) {
        if (dist(mouseX, mouseY, mouseLastX, mouseLastY) > 1) {
            mouseMovedRecently = true;
        } else {
            mouseMovedRecently = false;
        }
        mouseLastX = mouseX;
        mouseLastY = mouseY;

        let mousePos = createVector(mouseX, mouseY);

        // Update fireflies
        if (this.isDarkMode) {
            this.fireflies.forEach(firefly => {
                firefly.update(mousePos, mouseMovedRecently);
            });
        }
        // Curtain movements with sound
        this.windows.forEach(window => {
            let modifiedAudio = audioLevel * 2 + sin(frameCount * 0.05 + window.offset) * 0.2;
            window.curtainHeight = lerp(window.curtainHeight, 
                                     window.targetCurtainHeight * (0.6 + modifiedAudio), 
                                     0.1);
        });
    }

    drawLightEffects() {
        // Illuminate areas from lit windows
        this.windows.forEach(window => {
            if (window.isLightOn) {
                push();
                noStroke();
    
                for (let i = 2; i > 0; i--) { 
                    fill(35, 70, 95, 0.05 * i);
                    let size = window.width * (1.2 + i * 0.2); 
                    ellipse(window.x, window.y, size, size * 0.5); 
                }
                pop();
            }
        });
    
        // Street light 
        if (this.lightsOn) {
            const lightStartX = this.buildingWidth/2;
            const lightStartY = -this.buildingHeight/2;
            
            [1, -1].forEach(side => {
                push();
                noStroke();
                for (let i = 3; i > 0; i--) {
                    fill(60, 80, 95, 0.05 / i);
                    beginShape();
                    vertex(this.buildingX + side * lightStartX, this.buildingY + lightStartY);
                    vertex(this.buildingX + side * (lightStartX + 150), this.buildingY + this.buildingHeight/2);
                    vertex(this.buildingX + side * (lightStartX - 150), this.buildingY + this.buildingHeight/2);
                    endShape(CLOSE);
                }
                pop();
            });
        }
        // Door light
        if (this.lightsOn) {
            const doorLightY = this.buildingY + this.buildingHeight / 2 - this.buildingHeight * 0.25 - 20;
            const doorLightWidth = this.buildingWidth * 0.1;
            push();
            noStroke();
            for (let i = 3; i > 0; i--) {
                fill(60, 80, 95, 0.05 / i); 
                let size = doorLightWidth * (1 + i * 0.4); 
                ellipse(this.buildingX, doorLightY, size, size * 0.6); 
            }
            pop();
        }
    
    }

    display() {
        background(350, 10, 98);
    
        push();
        rectMode(CENTER);
        
        if (this.isDarkMode) {
            background(0);
            noStroke();
            fill(0, 0, 5);  
            rect(this.buildingX, this.buildingY, this.buildingWidth, this.buildingHeight);
    
            fill(0, 0, 8);  
            const doorWidth = this.buildingWidth * 0.15;
            const doorHeight = this.buildingHeight * 0.25;
            const doorY = this.buildingY + this.buildingHeight/2 - doorHeight/2;
            rect(this.buildingX, doorY, doorWidth, doorHeight);
    
            // Barely visible lines
            stroke(0, 0, 10);  
            strokeWeight(0.5); 
            const lineSpacing = this.buildingWidth / 12;
            for (let x = -5; x <= 5; x++) {
                let lineX = this.buildingX + (x * lineSpacing);
                line(lineX, this.buildingY - this.buildingHeight/2,
                     lineX, this.buildingY + this.buildingHeight/2);
            }
        } else {
            this.drawBuilding();
        }
        pop();
    

        if (this.isDarkMode) {
            this.windows.forEach(window => {
                window.isLightOn = true;
            });
            this.drawLightEffects();
        }
    
        this.drawStreetLights();
        this.windows.forEach(window => this.drawWindow(window));
        if (this.isDarkMode) {
            this.fireflies.forEach(firefly => firefly.display());
        }
    }

    drawWindow(window) {
        push();
        rectMode(CENTER);
        
        // Window frame with mode-dependent colors
        stroke(35, 30, 90);
        strokeWeight(2);
        fill(this.isDarkMode ? window.color : color(35, 10, 85));
        rect(window.x, window.y, window.width, window.height);
    
        // Window divisions
        line(window.x, window.y - window.height/2, 
             window.x, window.y + window.height/2);
        line(window.x - window.width/2, window.y, 
             window.x + window.width/2, window.y);

        // Lamp and glow effect
        if (window.isLightOn) {
            noStroke();
            drawingContext.save();
            beginShape();
            vertex(window.x - window.width/2, window.y - window.height/2);
            vertex(window.x + window.width/2, window.y - window.height/2);
            vertex(window.x + window.width/2, window.y + window.height/2);
            vertex(window.x - window.width/2, window.y + window.height/2);
            endShape(CLOSE);
            drawingContext.clip();
         
            // Lamp fixture - a small rectangle
            fill(35, 30, 85);
            rect(window.x, window.y - window.height * 0.2, window.width * 0.1, window.height * 0.1);
            
            // Light glow - elongated shape
            for (let i = 3; i > 0; i--) {
                fill(35, 70, 95, 0.1);
                ellipse(window.x, window.y, 
                        window.width * 0.01 * (i + 1),
                        window.height * 0.02 * (i + 1));
            }
            
            // Core light
            fill(35, 80, 95, 0.15);
            ellipse(window.x, window.y, window.width * 0.01, window.height * 0.02);
            
            drawingContext.restore();
         }
        
        // Gold curtain rod
        stroke(60, 80, 80);
        strokeWeight(3);
        line(window.x - window.width/2 - 10, window.y - window.height/2 - 5,
             window.x + window.width/2 + 10, window.y - window.height/2 - 5);
             
        // Rod ends
        noStroke();
        fill(60, 80, 80);
        circle(window.x - window.width/2 - 10, window.y - window.height/2 - 5, 8);
        circle(window.x + window.width/2 + 10, window.y - window.height/2 - 5, 8);

        // Curtains on top
        noStroke();
        fill(350, 40, 95, 0.9);
        
        const folds = 6;
        const foldWidth = window.width / (folds * 2);
        
        beginShape();
        vertex(window.x - window.width/2, window.y - window.height/2);
        
        for (let i = 0; i <= folds; i++) {
            let x = window.x - window.width/2 + i * foldWidth;
            let xOffset = sin(i * PI + frameCount * 0.05) * 5;
            
            vertex(x + xOffset, window.y - window.height/2 + window.curtainHeight);
            
            if (i < folds) {
                vertex(x + foldWidth/2 + xOffset, 
                      window.y - window.height/2 + window.curtainHeight * 0.9);
            }
        }
        
        for (let i = folds; i >= 0; i--) {
            let x = window.x - window.width/2 + i * foldWidth;
            let xOffset = sin(i * PI + frameCount * 0.05) * 5;
            vertex(x + xOffset, window.y - window.height/2);
        }
        
        endShape(CLOSE);

        beginShape();
        vertex(window.x + window.width/2, window.y - window.height/2);
        
        for (let i = 0; i <= folds; i++) {
            let x = window.x + window.width/2 - i * foldWidth;
            let xOffset = sin(i * PI + frameCount * 0.05) * 5;
            
            vertex(x + xOffset, window.y - window.height/2 + window.curtainHeight);
            
            if (i < folds) {
                vertex(x - foldWidth/2 + xOffset, 
                      window.y - window.height/2 + window.curtainHeight * 0.9);
            }
        }
        
        for (let i = folds; i >= 0; i--) {
            let x = window.x + window.width/2 - i * foldWidth;
            let xOffset = sin(i * PI + frameCount * 0.05) * 5;
            vertex(x + xOffset, window.y - window.height/2);
        }
        
        endShape(CLOSE);
        pop();
    }

    resize() {
        this.buildingWidth = width * 0.6;
        this.buildingHeight = height * 0.7;
        this.buildingX = width/2;
        this.buildingY = height/2;
        this.initializeElements();
    }

    toggleLights() {
        this.lightsOn = !this.lightsOn;
    }


    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
    }
}
