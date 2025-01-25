let particles = [];
let neonGrid;
let symmetricalPattern;
let colorPalette;
let wesScene;
let mic;
let fft;
let audioLevel = 0;
let isWesMode = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 1);
    
    // Audio setup with proper initialization
    userStartAudio(); // Add this to ensure audio context starts
    mic = new p5.AudioIn();
    mic.start();
    fft = new p5.FFT();
    fft.setInput(mic);
    
    // Initialize components
    colorPalette = new ColorPalette();
    neonGrid = new NeonGrid();
    symmetricalPattern = new SymmetricalPattern();
    wesScene = new WesScene();
    
    // Initial particles
    for (let i = 0; i < 50; i++) {
        particles.push(new LightParticle());
    }
}

function draw() {
    // Update audio analysis with smoothing
    fft.analyze();
    let targetLevel = mic.getLevel();
    audioLevel = lerp(audioLevel, targetLevel * 5, 0.1); // Amplify and smooth the audio level
    
    // Debug audio level
    console.log('Audio Level:', audioLevel);
    
    if (!isWesMode) {
        // Cyberpunk mode
        let fadeAmount = map(audioLevel, 0, 1, 0.1, 0.05);
        background(0, 0, 0, fadeAmount);
        
        neonGrid.update(audioLevel);
        neonGrid.display();
        
        symmetricalPattern.update();
        symmetricalPattern.display();
        
        for (let particle of particles) {
            particle.update(audioLevel);
            particle.display();
        }
        
        // Create new particles based on audio level
        if (random() < audioLevel * 2) { // Adjusted multiplier
            particles.push(new LightParticle(random(width), random(height)));
            if (particles.length > 150) {
                particles.splice(0, 1);
            }
        }
    } else {
        // Wes Anderson mode
        wesScene.update(audioLevel);
        wesScene.display();
    }
}

function mouseMoved() {
    if (!isWesMode) {
        // Only create particles in cyberpunk mode
        let p = new LightParticle(mouseX, mouseY);
        p.radius *= (1 + audioLevel * 10); // Adjusted multiplier
        particles.push(p);
        
        if (particles.length > 100) {
            particles.splice(0, 1);
        }
    }
}

function keyPressed() {
    if (key === ' ') {
        isWesMode = !isWesMode;
        // Reset particles when switching to Wes mode
        if (isWesMode) {
            particles = [];
        }
    }
    if (key === 'r') {
        // R key randomizes the pattern
        symmetricalPattern.randomize();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    neonGrid.resize();
    symmetricalPattern.resize();
    wesScene.resize();
}
