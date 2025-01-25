let particles = [];
let neonGrid;
let symmetricalPattern;
let colorPalette;
let wesScene;
let mic;
let fft;
let audioLevel = 0;
let isWesMode = false;
let avoidPattern = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 1);
    
    userStartAudio();
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    
    colorPalette = new ColorPalette();
    neonGrid = new NeonGrid();
    symmetricalPattern = new SymmetricalPattern();
    wesScene = new WesScene();
    
    for (let i = 0; i < 50; i++) {
        particles.push(new LightParticle());
    }
}

function draw() {
    fft.analyze();
    let targetLevel = mic.getLevel();
    audioLevel = lerp(audioLevel, targetLevel * 5, 0.1);
    
    if (!isWesMode) {
        let fadeAmount = map(audioLevel, 0, 1, 0.1, 0.05);
        background(0, 0, 0, fadeAmount);
        
        neonGrid.update(audioLevel);
        neonGrid.display();
        
        symmetricalPattern.update();
        symmetricalPattern.display();
        
        for (let particle of particles) {
            particle.update(audioLevel, symmetricalPattern, avoidPattern, symmetricalPattern.blackHoleMode);
            particle.display();
        }
        
        if (random() < audioLevel * 2) {
            particles.push(new LightParticle(random(width), random(height)));
            if (particles.length > 150) {
                particles.splice(0, 1);
            }
        }
    } else {
        wesScene.update(audioLevel);
        wesScene.display();
    }
}

function mouseMoved() {
    if (!isWesMode) {
        let p = new LightParticle(mouseX, mouseY);
        p.radius *= (1 + audioLevel * 10);
        particles.push(p);
        
        if (particles.length > 100) {
            particles.splice(0, 1);
        }
    }
}

function keyPressed() {
    if (key === ' ') {
        isWesMode = !isWesMode;
        if (isWesMode) {
            particles = [];
        }
    }
    if (key === 'r') {
        symmetricalPattern.randomize();
    }
    if (key === 'f') {
        avoidPattern = !avoidPattern;
        if (avoidPattern && symmetricalPattern.blackHoleMode) {
            symmetricalPattern.blackHoleMode = false;
        }
    }
    if (key === 'b') {
        symmetricalPattern.toggleBlackHoleMode();
        if (symmetricalPattern.blackHoleMode && avoidPattern) {
            avoidPattern = false;
        }
    }
    if (key === 'g') {
        neonGrid.toggleVisibility();
    }
    if (key === 'l') {
        wesScene.toggleLights();
    }
    if (key === 'd') {
        wesScene.toggleDarkMode();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    neonGrid.resize();
    symmetricalPattern.resize();
    wesScene.resize();
}
