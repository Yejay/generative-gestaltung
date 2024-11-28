// particle.js
class Particle {
  constructor(x, y, hu, firework, shape = 'circle') {
    this.pos = createVector(x, y);
    this.firework = firework;
    this.lifespan = 255;
    this.hu = hu;
    this.acc = createVector(0, 0);
    this.shape = shape;
    this.trail = [];
    this.glitter = random() < 0.5; // 50% chance of glitter effect
    
    if (this.firework) {
      this.vel = createVector(0, random(-16, -8));
    } else {
      this.vel = p5.Vector.random2D();
      this.vel.mult(random(2, 10));
    }
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.firework) {
      this.vel.mult(0.9);
      this.lifespan -= 4;
      
      if (this.glitter && random() < 0.2) {
        this.vel.add(p5.Vector.random2D().mult(0.5));
      }
    }
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    if (this.trail.length < 5) {
      this.trail.push(this.pos.copy());
    } else {
      this.trail.shift();
      this.trail.push(this.pos.copy());
    }
  }

  done() {
    return this.lifespan < 0;
  }

  show() {
    colorMode(HSB);

    if (!this.firework) {
      strokeWeight(2);
      stroke(this.hu, 255, 255, this.lifespan);

      // Draw trail
      for (let i = 0; i < this.trail.length - 1; i++) {
        let alpha = map(i, 0, this.trail.length - 1, 0, this.lifespan);
        stroke(this.hu, 255, 255, alpha);
        line(this.trail[i].x, this.trail[i].y, this.trail[i + 1].x, this.trail[i + 1].y);
      }

      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading());
      
      if (this.shape === 'heart') {
        this.drawHeart();
      } else if (this.shape === 'star') {
        this.drawStar();
      } else if (this.shape === 'spiral') {
        this.drawSpiral();
      } else {
        ellipse(0, 0, 4);
      }
      
      pop();
    } else {
      strokeWeight(4);
      stroke(this.hu, 255, 255);
      point(this.pos.x, this.pos.y);
    }
  }

  drawHeart() {
    beginShape();
    vertex(0, -2);
    bezierVertex(2, -4, 4, -2, 4, 1);
    bezierVertex(4, 3, 2, 4, 0, 6);
    bezierVertex(-2, 4, -4, 3, -4, 1);
    bezierVertex(-4, -2, -2, -4, 0, -2);
    endShape(CLOSE);
  }

  drawStar() {
    beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = TWO_PI * i / 5 - HALF_PI;
      let x = cos(angle) * 2;
      let y = sin(angle) * 2;
      vertex(x, y);
      angle += TWO_PI / 10;
      x = cos(angle) * 1;
      y = sin(angle) * 1;
      vertex(x, y);
    }
    endShape(CLOSE);
  }

  drawSpiral() {
    for (let i = 0; i < 10; i++) {
      let angle = i * 0.5;
      let x = cos(angle) * i * 0.3;
      let y = sin(angle) * i * 0.3;
      point(x, y);
    }
  }
}