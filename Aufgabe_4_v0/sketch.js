// sketch.js
let fireworks = [];
let gravity;
let stars = [];
let launchSound, explosionSound;
let font;
let showPhase = 0;
let phaseStartTime;
let showDuration = 60; // Show duration in seconds

function preload() {
  font = loadFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf');
  
  // Create placeholder sound objects
  launchSound = {
    play: function() {
      console.log("Launch sound played");
    }
  };
  explosionSound = {
    play: function() {
      console.log("Explosion sound played");
    }
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);
  gravity = createVector(0, 0.2);
  stroke(255);
  strokeWeight(4);
  background(0);
  
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }

  phaseStartTime = millis();
}

function draw() {
  colorMode(RGB);
  background(0, 0, 0, 25);
  
  // Draw and animate stars
  for (let star of stars) {
    star.show();
  }

  // Water reflection effect
  drawWaterReflection();

  // Update and show fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }

  // Run the fireworks show
  runFireworksShow();

  // Display show progress
  showProgress();
}

function drawWaterReflection() {
  let waterHeight = height * 0.2;
  let waterTop = height - waterHeight;
  
  // Create gradient for water
  for (let y = waterTop; y < height; y++) {
    let inter = map(y, waterTop, height, 0, 1);
    let c = lerpColor(color(0, 0, 50, 0), color(0, 0, 100, 50), inter);
    stroke(c);
    line(0, y, width, y);
  }
  
  // Add ripple effect
  noFill();
  stroke(255, 255, 255, 20);
  for (let i = 0; i < 5; i++) {
    let yOffset = sin(frameCount * 0.05 + i) * 5;
    beginShape();
    for (let x = 0; x < width; x += 20) {
      let y = waterTop + noise(x * 0.01, frameCount * 0.01) * 20 + yOffset;
      curveVertex(x, y);
    }
    endShape();
  }
}

function runFireworksShow() {
  let elapsedTime = (millis() - phaseStartTime) / 1000; // Convert to seconds
  let totalElapsedTime = (millis() - phaseStartTime) / 1000;

  switch(showPhase) {
    case 0: // Opening burst
      if (elapsedTime < 5 && frameCount % 15 === 0) {
        launchFirework(width / 2, height, 0, -16, 'circle');
      } else if (elapsedTime >= 5) {
        nextPhase();
      }
      break;
    case 1: // Alternating sides with shapes
      if (elapsedTime < 10 && frameCount % 30 === 0) {
        let side = frameCount % 60 === 0 ? 0 : width;
        let shape = random(['heart', 'star', 'spiral']);
        launchFirework(side, height, side === 0 ? 5 : -5, -15, shape);
      } else if (elapsedTime >= 10) {
        nextPhase();
      }
      break;
    case 2: // Text fireworks
      if (elapsedTime < 15 && frameCount % 60 === 0) {
        let text = ['WOW', 'BOOM', 'POW', 'ZAP', 'v0'][floor(random(5))];
        fireworks.push(new TextFirework(text, font, random(width), height));
      } else if (elapsedTime >= 15) {
        nextPhase();
      }
      break;
    case 3: // Spiral pattern with mixed shapes
      if (elapsedTime < 20) {
        let angle = frameCount * 0.1;
        let x = width / 2 + cos(angle) * 200;
        let y = height / 2 + sin(angle) * 200;
        if (frameCount % 5 === 0) {
          let shape = ['circle', 'heart', 'star', 'spiral'][floor(random(4))];
          launchFirework(x, y, 0, 0, shape);
        }
      } else if (elapsedTime >= 20) {
        nextPhase();
      }
      break;
    case 4: // Grand finale
      if (elapsedTime < 10) {
        if (frameCount % 5 === 0) {
          for (let i = 0; i < 3; i++) {
            let shape = ['circle', 'heart', 'star', 'spiral', 'text'][floor(random(5))];
            if (shape === 'text') {
              let text = ['WOW', 'BOOM', 'POW', 'ZAP', 'v0'][floor(random(5))];
              fireworks.push(new TextFirework(text, font, random(width), height, random(-2, 2), random(-15, -10)));
            } else {
              launchFirework(random(width), height, random(-2, 2), random(-15, -10), shape);
            }
          }
        }
      } else {
        nextPhase();
      }
      break;
    default:
      // Show ended, restart after a brief pause
      if (elapsedTime > 5) {
        showPhase = 0;
        phaseStartTime = millis();
      }
  }

  // Check if the entire show duration has elapsed
  if (totalElapsedTime >= showDuration) {
    showPhase = 0;
    phaseStartTime = millis();
  }
}

function launchFirework(x, y, vx, vy, shape) {
  let firework = new Firework(x, y, vx, vy, shape);
  fireworks.push(firework);
  launchSound.play();
}

function nextPhase() {
  showPhase++;
  phaseStartTime = millis();
}

function showProgress() {
  let progress = ((millis() - phaseStartTime) / 1000) / showDuration;
  noStroke();
  fill(255, 255, 255, 100);
  rect(0, height - 5, width * progress, 5);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  stars = [];
  for (let i = 0; i < 200; i++) {
    stars.push(new Star());
  }
}