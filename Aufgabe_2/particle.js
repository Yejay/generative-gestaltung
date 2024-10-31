class Leaf {
    constructor() {
      // Initialize leaf properties
      this.pos = createVector(random(width), random(-50, 0));
      this.vel = createVector(0, 0);
      this.acc = createVector(0, 0);
      this.maxspeed = random(1, 5);  // Adjust leaf speed range here
      this.color = color(random([
        '#e63946',  // Red
        '#f4a261',  // Orange
        '#e9c46a',  // Yellow
        '#2a9d8f',  // Green
      ]));  // Adjust or add leaf colors here
      this.size = random(10, 20);  // Adjust leaf size range here
    }
  
    update() {
      // Update leaf physics
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.acc.add(createVector(0, .5));  // Adjust gravity here
    }
  
    follow(vectors) {
      // Make leaf follow flow field
      let x = floor(this.pos.x / scl);
      let y = floor(this.pos.y / scl);
      let index = constrain(x + y * cols, 0, vectors.length - 1);
      let force = vectors[index];
      this.applyForce(force);
    }
  
    applyForce(force) {
      // Apply force to leaf
      this.acc.add(force);
    }
  
    show() {
      // Display leaf
      fill(this.color);
      noStroke();
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.vel.heading() + PI / 2);
      beginShape();
      vertex(0, -this.size);
      bezierVertex(this.size / 2, -this.size / 2, this.size / 2, this.size / 2, 0, this.size);
      bezierVertex(-this.size / 2, this.size / 2, -this.size / 2, -this.size / 2, 0, -this.size);
      endShape(CLOSE);
      pop();
    }
  
    // TODO
    edges() {
      // Reset leaf position when it goes off screen
      const groundHeight = 0;  // If rect aka ground is visible in sketch.js, set this to 50 otherwise 0
      if (this.pos.y > height - groundHeight || this.pos.x > width || this.pos.x < 0) {
        this.reset();
      }
    }
  
    reset() {
      // Reset leaf to top of screen
      this.pos = createVector(random(width), random(-50, -10));
      this.vel = createVector(0, 0);
      this.acc = createVector(0, 0);
    }
  }