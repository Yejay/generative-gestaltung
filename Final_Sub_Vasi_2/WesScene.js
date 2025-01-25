class WesScene {
    constructor() {
        this.windows = [];
        this.fireflies = [];
        this.buildingWidth = width * 0.8;
        this.buildingHeight = height * 0.8;
        this.buildingX = width/2;
        this.buildingY = height/2;
        this.lightsOn = false;
        this.isDarkMode = false;
        for (let i = 10; i < 40; i++) {
            this.fireflies.push(new Firefly(random(width), random(height)));
        }
        this.initializeElements();
    }
 
    initializeElements() {
        const windowWidth = this.buildingWidth * 0.15;
        const windowHeight = this.buildingHeight * 0.18;
        const spacingX = windowWidth * 1.3;
        const startX = this.buildingX - (spacingX * 1.5);
 
        this.createFloorWindows(4, startX, spacingX, this.buildingY - this.buildingHeight * 0.35, windowWidth, windowHeight); 
        this.createFloorWindows(4, startX, spacingX, this.buildingY - this.buildingHeight * 0.05, windowWidth, windowHeight); 
        this.createBottomFloorWindows(windowWidth, windowHeight); 
    }
 
    createFloorWindows(count, startX, spacingX, y, width, height) {
        for (let i = 0; i < count; i++) {
            this.windows.push({
                x: startX + (spacingX * i),
                y: y,
                width: width,
                height: height,
                curtainHeight: 0,
                targetCurtainHeight: height,
                color: color(35, 70, 95),
                offset: random(TWO_PI),
                isLightOn: false
            });
        }
    }
 
    createBottomFloorWindows(width, height) {
        const sideWindowOffset = this.buildingWidth * 0.3;
        const y = this.buildingY + this.buildingHeight * 0.25;
        
        [-1, 1].forEach(side => {
            this.windows.push({
                x: this.buildingX + side * sideWindowOffset,
                y: y,
                width: width,
                height: height,
                curtainHeight: 0,
                targetCurtainHeight: height,
                color: color(35, 70, 95),
                offset: random(TWO_PI),
                isLightOn: false
            });
        });
    }
 
    update(audioLevel) {
        const mousePos = createVector(mouseX, mouseY);
        const mouseMoved = dist(mouseX, mouseY, window.mouseLastX, window.mouseLastY) > 1;
    
        if (this.isDarkMode) {
            this.fireflies.forEach(firefly => {
                firefly.update(mousePos, mouseMoved);
            });
        }
        window.mouseLastX = mouseX;
        window.mouseLastY = mouseY;
    
        this.windows.forEach(window => {
            let modifiedAudio = audioLevel * 2 + sin(frameCount * 0.05 + window.offset) * 0.2;
            window.curtainHeight = lerp(window.curtainHeight, 
                                     window.targetCurtainHeight * (0.6 + modifiedAudio), 
                                     0.1);
        });
    }
 
    updateWindows(audioLevel) {
        this.windows.forEach(window => {
            let modifiedAudio = audioLevel * 2 + sin(frameCount * 0.05 + window.offset) * 0.2;
            window.curtainHeight = lerp(window.curtainHeight, 
                                     window.targetCurtainHeight * (0.6 + modifiedAudio), 
                                     0.1);
        });
    }
 
    display() {
        this.drawBackground();
        this.drawBuilding();
        this.drawStreetLights();
        this.windows.forEach(window => this.drawWindow(window));

        if (this.isDarkMode) {
            this.drawLightEffects();
            this.fireflies.forEach(firefly => firefly.display());
        }
    }
 
    drawBackground() {
        background(this.isDarkMode ? 0 : color(350, 10, 98));
    }
 
    drawBuilding() {
        push();
        rectMode(CENTER);
        if (this.isDarkMode) {
            this.drawDarkBuilding();
        } else {
            this.drawLightBuilding();
        }
        pop();
    }
 
    drawDarkBuilding() {
        noStroke();
        fill(0, 0, 5);
        rect(this.buildingX, this.buildingY, this.buildingWidth, this.buildingHeight);
        fill(0, 0, 8);
        const doorWidth = this.buildingWidth * 0.15;
        const doorHeight = this.buildingHeight * 0.25;
        const doorY = this.buildingY + this.buildingHeight/2 - doorHeight/2;
        rect(this.buildingX, doorY, doorWidth, doorHeight);
 
        stroke(0, 0, 10);
        strokeWeight(0.5);
        this.drawBuildingLines();
    }
 
    drawLightBuilding() {
        fill(350, 15, 95);
        noStroke();
        rect(this.buildingX, this.buildingY, this.buildingWidth, this.buildingHeight);
 
        const doorWidth = this.buildingWidth * 0.15;
        const doorHeight = this.buildingHeight * 0.25;
        const doorY = this.buildingY + this.buildingHeight/2 - doorHeight/2;
        
        fill(35, 30, 85);
        rect(this.buildingX, doorY, doorWidth, doorHeight);
 
        stroke(35, 30, 90);
        strokeWeight(2);
        [-1, 1].forEach(side => {
            line(this.buildingX + side * doorWidth * 0.25, doorY - doorHeight/2,
                 this.buildingX + side * doorWidth * 0.25, doorY + doorHeight/2);
        });
 
        const lightFixtureY = doorY - doorHeight / 2 - 20;
        fill(60, 80, 80);
        rect(this.buildingX, lightFixtureY, doorWidth * 0.5, 10, 5);
 
        this.drawBuildingLines();
    }
 
    drawBuildingLines() {
        const lineSpacing = this.buildingWidth / 12;
        for (let x = -5; x <= 5; x++) {
            let lineX = this.buildingX + (x * lineSpacing);
            let yOffset = sin(frameCount * 0.02 + x) * 3;
            line(lineX, this.buildingY - this.buildingHeight/2 + yOffset,
                 lineX, this.buildingY + this.buildingHeight/2 + yOffset);
        }
    }
 
    drawStreetLights() {
        if (!this.lightsOn) return;
        const lightStartX = this.buildingWidth/2;
        const lightStartY = -this.buildingHeight/2;
        
        [-1, 1].forEach(side => {
            push();
            translate(this.buildingX + side * lightStartX, this.buildingY + lightStartY);
            
            stroke(35, 30, 90);
            strokeWeight(3);
            fill(60, 80, 80);
            rect(-10, 0, 20, 10);
            
            noStroke();
            for(let i = 0; i < 5; i++) {
                fill(60, 80, 95, 0.1 - i * 0.02);
                beginShape();
                vertex(-10, 0);
                vertex(10, 0);
                vertex(150, this.buildingHeight);
                vertex(-150, this.buildingHeight);
                endShape(CLOSE);
            }
            pop();
        });
    }
 
    drawWindow(window) {
        push();
        rectMode(CENTER);
        
        stroke(35, 30, 90);
        strokeWeight(2);
        fill(this.isDarkMode ? window.color : color(35, 10, 85));
        rect(window.x, window.y, window.width, window.height);
 
        line(window.x, window.y - window.height/2, 
             window.x, window.y + window.height/2);
        line(window.x - window.width/2, window.y, 
             window.x + window.width/2, window.y);

        this.drawCurtains(window);
        
        pop();
    }
 
    drawCurtains(window) {
        stroke(60, 80, 80);
        strokeWeight(3);
        line(window.x - window.width/2 - 10, window.y - window.height/2 - 5,
             window.x + window.width/2 + 10, window.y - window.height/2 - 5);
             
        noStroke();
        fill(60, 80, 80);
        circle(window.x - window.width/2 - 10, window.y - window.height/2 - 5, 8);
        circle(window.x + window.width/2 + 10, window.y - window.height/2 - 5, 8);
 
        fill(350, 40, 95, 0.9);
        this.drawCurtainPair(window);
    }
 
    drawCurtainPair(window) {
        const folds = 6;
        const foldWidth = window.width / (folds * 2);
        
        [-1, 1].forEach(side => {
            this.drawSingleCurtain(window, folds, foldWidth, side);
        });
    }
 
    drawSingleCurtain(window, folds, foldWidth, side) {
        beginShape();
        vertex(window.x + side * window.width/2, window.y - window.height/2);
        
        for (let i = 0; i <= folds; i++) {
            const x = window.x + side * (window.width/2 - i * foldWidth);
            const xOffset = sin(i * PI + frameCount * 0.05) * 5;
            
            vertex(x + xOffset, window.y - window.height/2 + window.curtainHeight);
            
            if (i < folds) {
                vertex(x - side * foldWidth/2 + xOffset, 
                      window.y - window.height/2 + window.curtainHeight * 0.9);
            }
        }
        
        for (let i = folds; i >= 0; i--) {
            const x = window.x + side * (window.width/2 - i * foldWidth);
            const xOffset = sin(i * PI + frameCount * 0.05) * 5;
            vertex(x + xOffset, window.y - window.height/2);
        }
        
        endShape(CLOSE);
    }
 
    drawLightEffects() {
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
        if (this.lightsOn) {
            this.drawStreetLightEffects();
            this.drawDoorLightEffect();
        }
    }
 
    drawStreetLightEffects() {
        const lightStartX = this.buildingWidth/2;
        const lightStartY = -this.buildingHeight/2;
        
        [-1, 1].forEach(side => {
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
 
    drawDoorLightEffect() {
        const doorLightY = this.buildingY + this.buildingHeight/2 - this.buildingHeight * 0.25 - 20;
        const doorLightWidth = this.buildingWidth * 0.1;
        
        push();
        noStroke();
        for (let i = 3; i > 0; i--) {
            fill(60, 80, 95, 0.05 / i);
            const size = doorLightWidth * (1 + i * 0.4);
            ellipse(this.buildingX, doorLightY, size, size * 0.6);
        }
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
        if (this.isDarkMode) {
            this.windows.forEach(window => {
                window.isLightOn = true; 
            });
        } else {
            this.windows.forEach(window => {
                window.isLightOn = this.lightsOn; 
            });
        }
    }
 }
