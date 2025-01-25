class WesScene {
    constructor() {
        this.windows = [];
        this.curtains = [];
        this.audioReactiveElements = [];
        this.colorOffset = 0;
        this.initializeElements();
    }

    initializeElements() {
        // Create a grid of windows
        const windowColumns = 5;
        const windowRows = 3;
        const windowWidth = width / (windowColumns + 1);
        const windowHeight = height / (windowRows + 1);

        for (let i = 0; i < windowColumns; i++) {
            for (let j = 0; j < windowRows; j++) {
                this.windows.push({
                    x: (i + 1) * windowWidth,
                    y: (j + 1) * windowHeight,
                    width: windowWidth * 0.8,
                    height: windowHeight * 0.8,
                    curtainHeight: 0,
                    targetCurtainHeight: windowHeight * 0.8,
                    color: color(random([35, 350, 200, 150]), 60, 95),
                    offset: random(TWO_PI)
                });
            }
        }

        // Create audio reactive decorative elements
        for (let i = 0; i < 20; i++) {
            this.audioReactiveElements.push({
                x: random(width),
                y: random(height),
                size: random(10, 30),
                baseSize: random(10, 30),
                rotation: random(TWO_PI),
                color: color(random([35, 350, 200, 150]), 60, 95),
                offset: random(TWO_PI)
            });
        }
    }

    update(audioLevel) {
        this.colorOffset += 0.01;
        
        // Debug audio level in Wes scene
        console.log('Wes Scene Audio Level:', audioLevel);
        
        // Update curtain animations with amplified audio reaction
        this.windows.forEach((window, index) => {
            let modifiedAudio = audioLevel * 2 + sin(frameCount * 0.05 + window.offset) * 0.2;
            window.curtainHeight = lerp(window.curtainHeight, 
                                     window.targetCurtainHeight * (0.6 + modifiedAudio), 
                                     0.1);
        });

        // Update decorative elements with more pronounced audio reaction
        this.audioReactiveElements.forEach((element, index) => {
            let modifiedAudio = audioLevel * 3 + sin(frameCount * 0.05 + element.offset) * 0.2;
            element.size = element.baseSize * (1 + modifiedAudio);
            element.rotation += 0.02 * (1 + audioLevel * 5);
        });
    }

    display() {
        background(350, 10, 98); // Soft cream background

        // Draw central symmetrical building facade
        push();
        translate(width/2, height/2);
        this.drawBuildingFacade();
        pop();

        // Draw windows with curtains
        this.windows.forEach(window => {
            this.drawWindow(window);
        });

        // Draw decorative elements
        this.audioReactiveElements.forEach(element => {
            this.drawDecorativeElement(element);
        });

        // Debug visualization of audio level
        this.drawAudioDebug();
    }

    drawBuildingFacade() {
        // Main building outline
        noStroke();
        fill(350, 15, 95);
        rectMode(CENTER);
        rect(0, 0, width * 0.9, height * 0.9);

        // Decorative lines with subtle animation
        stroke(35, 30, 90);
        strokeWeight(2);
        for (let i = -4; i <= 4; i++) {
            let yOffset = sin(frameCount * 0.02 + i) * 5;
            line(i * 50, -height/2 + yOffset, i * 50, height/2 + yOffset);
        }
    }

    drawWindow(window) {
        // Window frame
        stroke(35, 30, 90);
        strokeWeight(2);
        fill(window.color);
        rect(window.x, window.y, window.width, window.height);

        // Curtains with subtle wave effect
        noStroke();
        fill(350, 30, 95, 0.8);
        
        // Left curtain with wave
        beginShape();
        for (let y = 0; y < window.curtainHeight; y += 5) {
            let xOff = sin(y * 0.1 + frameCount * 0.05) * 5;
            let x = window.x - window.width/2 + xOff;
            vertex(x, window.y - window.height/2 + y);
        }
        endShape();

        // Right curtain with wave
        beginShape();
        for (let y = 0; y < window.curtainHeight; y += 5) {
            let xOff = sin(y * 0.1 + frameCount * 0.05) * 5;
            let x = window.x + window.width/2 - window.width * 0.3 + xOff;
            vertex(x, window.y - window.height/2 + y);
        }
        endShape();
    }

    drawDecorativeElement(element) {
        push();
        translate(element.x, element.y);
        rotate(element.rotation);
        noStroke();
        fill(element.color);
        
        // Draw a more complex decorative shape
        beginShape();
        for (let i = 0; i < 8; i++) {
            let angle = TWO_PI * i / 8;
            let radius = element.size * (1 + sin(angle * 2 + frameCount * 0.05) * 0.2);
            let x = cos(angle) * radius;
            let y = sin(angle) * radius;
            vertex(x, y);
        }
        endShape(CLOSE);
        pop();
    }

    // Debug visualization
    drawAudioDebug() {
        fill(0);
        noStroke();
        text('Audio Level: ' + nf(audioLevel, 1, 3), 20, 20);
        rect(20, 30, audioLevel * 100, 10);
    }

    resize() {
        this.initializeElements();
    }
}
