let fireworks = [];
let explosionParticles = [];
let gravity;
let stars = [];
let explosionSound, launchSound;
let soundsLoaded = false;

function preload() {
  explosionSound = loadSound('https://assets.mixkit.co/active_storage/sfx/1647/1647.wav', 
    () => {
      explosionSound.setVolume(0.3);
      soundsLoaded = true;
    }
  );
  launchSound = loadSound('https://assets.mixkit.co/active_storage/sfx/2873/2873.wav',
    () => {
      launchSound.setVolume(0.2);
      soundsLoaded = true;
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  gravity = createVector(0, 0.2);
  initializeStars();
}

function draw() {
  background(240, 20, 5, 0.2);
  drawStars();
  
  if (random(1) < 0.03) {
    launchFirework();
  }
  
  updateAndDisplayFireworks();
  updateAndDisplayExplosions();
}

function launchFirework() {
  let x = random(width * 0.1, width * 0.9);
  let targetHeight = random(height * 0.2, height * 0.6);
  fireworks.push(new Firework(x, height, targetHeight));
  launchSound.play();
}

function initializeStars() {
  for (let i = 0; i < 300; i++) {
    stars.push({
      pos: createVector(random(width), random(height)),
      brightness: random(0.3, 1),
      size: random(1, 2.5),
      twinkleSpeed: random(0.02, 0.08)
    });
  }
}

function drawStars() {
  noStroke();
  for (let star of stars) {
    let twinkle = sin(frameCount * star.twinkleSpeed) * 0.3 + 0.7;
    fill(0, 0, 100, star.brightness * twinkle);
    circle(star.pos.x, star.pos.y, star.size);
  }
}

function updateAndDisplayFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let fw = fireworks[i];
    fw.update();
    fw.display();
    
    if (fw.isDead()) {
      createExplosionParticles(fw.pos.x, fw.pos.y, fw.color, fw.type);
      explosionSound.play();
      fireworks.splice(i, 1);
    }
  }
}

function updateAndDisplayExplosions() {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    let p = explosionParticles[i];
    updateExplosionParticle(p);
    displayExplosionParticle(p);
    
    if (p.life <= 0) {
      explosionParticles.splice(i, 1);
    }
  }
}

class Firework {
  constructor(x, y, targetHeight) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), -sqrt(2 * gravity.y * (y - targetHeight)));
    this.acc = createVector(0, 0);
    this.color = random(360);
    this.trail = [];
    this.dead = false;
    this.type = floor(random(5));
  }
  
  update() {
    this.acc.add(gravity);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    this.trail.push(this.pos.copy());
    if (this.trail.length > 15) {
      this.trail.shift();
    }
    
    if (this.vel.y > 0) {
      this.dead = true;
    }
  }
  
  display() {
    noFill();
    for (let i = 1; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length, 0, 1);
      strokeWeight(map(i, 0, this.trail.length, 1, 4));
      stroke(this.color, 80, 100, alpha);
      line(this.trail[i-1].x, this.trail[i-1].y, 
           this.trail[i].x, this.trail[i].y);
    }
    
    noStroke();
    fill(this.color, 80, 100, 0.8);
    circle(this.pos.x, this.pos.y, 6);
  }
  
  isDead() {
    return this.dead;
  }
}

function createExplosionParticles(x, y, baseColor, type) {
  let particleCount = random(100, 200);
  
  for (let i = 0; i < particleCount; i++) {
    let angle, speed;
    
    switch(type) {
      case 0: // Circular
        angle = random(TWO_PI);
        speed = random(5, 15);
        break;
      case 1: // Heart shape
        angle = random(TWO_PI);
        let r = 16 * pow(sin(angle), 3);
        speed = r * random(0.5, 1.5);
        break;
      case 2: // Double spiral
        angle = random(TWO_PI);
        speed = angle * 0.5 + random(5, 10);
        break;
      case 3: // Star pattern
        angle = floor(random(5)) * TWO_PI / 5 + random(-0.2, 0.2);
        speed = random(8, 16);
        break;
      case 4: // Ring with trails
        angle = random(TWO_PI);
        speed = 12 + random(-2, 2);
        break;
    }
    
    let vel = p5.Vector.fromAngle(angle).mult(speed);
    let colorVariation = random(-20, 20);
    let finalColor = (baseColor + colorVariation + 360) % 360;
    
    explosionParticles.push({
      pos: createVector(x, y),
      vel: vel,
      color: finalColor,
      life: 255,
      hasTail: random() < 0.3,
      trail: [],
      glowSize: random(2, 6),
      decay: random(1.5, 3),
      canSplit: random() < 0.2
    });
  }
}

function updateExplosionParticle(p) {
  p.vel.add(gravity);
  p.pos.add(p.vel);
  p.life -= p.decay;
  
  if (p.hasTail) {
    p.trail.push(p.pos.copy());
    if (p.trail.length > 10) p.trail.shift();
  }
  
  if (p.canSplit && p.life < 128 && random() < 0.02) {
    let splitCount = floor(random(3, 6));
    for (let j = 0; j < splitCount; j++) {
      explosionParticles.push({
        pos: p.pos.copy(),
        vel: p5.Vector.random2D().mult(random(2, 5)),
        color: (p.color + random(-40, 40) + 360) % 360,
        life: p.life * 0.8,
        hasTail: true,
        trail: [],
        glowSize: p.glowSize * 0.7,
        decay: p.decay * 1.2,
        canSplit: false
      });
    }
    p.life = 0;
  }
}

function displayExplosionParticle(p) {
  if (p.hasTail) {
    noFill();
    for (let j = 1; j < p.trail.length; j++) {
      let alpha = map(j, 0, p.trail.length, 0, p.life/255);
      stroke(p.color, 80, 100, alpha);
      strokeWeight(2);
      line(p.trail[j-1].x, p.trail[j-1].y,
           p.trail[j].x, p.trail[j].y);
    }
  }
  
  noStroke();
  for (let j = 3; j > 0; j--) {
    fill(p.color, 80, 100, (p.life/255) / j);
    circle(p.pos.x, p.pos.y, p.glowSize * j);
  }
}

function mousePressed() {
  fireworks.push(new Firework(mouseX, height, mouseY));
  launchSound.play();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
