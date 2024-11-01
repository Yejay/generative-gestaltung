class Leaf {
    constructor() {
      this.pos = createVector(random(width), random(-50, 0));
      this.vel = createVector(0, 0);
      this.acc = createVector(0, 0);
      this.maxspeed = random(1, 5);
      this.color = color(random([
        '#e63946',  // Red
        '#f4a261',  // Orange
        '#e9c46a',  // Yellow
        '#2a9d8f',  // Green
      ]));
      this.size = random(10, 20);
      this.shapeType = floor(random(4));
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
      switch (this.shapeType) {
        case 0: // Shape 1 - Original Leaf
            vertex(0, -this.size);
            bezierVertex(this.size / 2, -this.size / 2, this.size / 2, this.size / 2, 0, this.size);
            bezierVertex(-this.size / 2, this.size / 2, -this.size / 2, -this.size / 2, 0, -this.size);
            break;

        case 1: // Shape 2 - Longer, thinner leaf
            vertex(0, -this.size);
            bezierVertex(this.size / 3, -this.size / 1.5, this.size / 2, this.size / 1.5, 0, this.size);
            bezierVertex(-this.size / 2, this.size / 1.5, -this.size / 3, -this.size / 1.5, 0, -this.size);
            break;

        case 2: // Shape 3 - Rounded leaf
            vertex(0, -this.size);
            bezierVertex(this.size, -this.size / 2, this.size, this.size / 2, 0, this.size);
            bezierVertex(-this.size, this.size / 2, -this.size, -this.size / 2, 0, -this.size);
            break;

        case 3: // Shape 4 - Pointed leaf with curve
            vertex(0, -this.size);
            bezierVertex(this.size / 1.5, -this.size / 3, this.size / 1.5, this.size / 2, 0, this.size);
            bezierVertex(-this.size / 1.5, this.size / 2, -this.size / 1.5, -this.size / 3, 0, -this.size);
            break;
    }

    endShape(CLOSE);
    pop();
    }
  
    edges() {
      if (this.pos.y > height  || this.pos.x > width || this.pos.x < 0) {
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