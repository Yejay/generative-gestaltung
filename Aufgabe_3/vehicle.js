class Vehicle {
  constructor(x, y, targetX, targetY) {
      this.pos = createVector(x, y);
      this.vel = p5.Vector.random2D();
      this.acc = createVector();
      this.target = createVector(targetX, targetY);
      this.maxSpeed = random(8, 12);
      this.maxForce = random(0.8, 1.2);
      this.size = random(4, 8);
      this.color = random(360);
  }

  move() {
      let targetForce = this.getTargetForce();
      this.acc.add(targetForce);

      let wanderForce = this.getWanderForce();
      this.acc.add(wanderForce);

      if (forceActive) {
          let mouseForce = this.getMouseForce();
          this.acc.add(mouseForce);
      }
  }

  getTargetForce() {
      // Calculate vector pointing from current position to target
      let desired = p5.Vector.sub(this.target, this.pos);
      let distance = desired.mag();
      
      // Slow down when getting closer (within 100 pixels)
      let speed = distance < 100 ? map(distance, 0, 100, 0, this.maxSpeed) : this.maxSpeed;
      desired.setMag(speed);
      
      // Calculate steering force (desired minus current velocity)
      let steer = p5.Vector.sub(desired, this.vel);
      return steer.limit(this.maxForce).mult(0.6);
  }

  getWanderForce() {
      // Use Perlin noise to generate smooth random movement
      return p5.Vector.fromAngle(
          noise(this.pos.x * 0.01, this.pos.y * 0.01) * TWO_PI * 2
      ).mult(0.1);
  }

  getMouseForce() {
      // Get vector pointing from particle to mouse
      let mousePos = createVector(mouseX, mouseY);
      let force = p5.Vector.sub(mousePos, this.pos);
      // Constrain distance to prevent extreme forces
      let distance = constrain(force.mag(), 20, 100);
      
      if (!attractMode) {
          force.mult(-1);
      }
      
      force.normalize();
      let strength = 2.0 / (distance * 0.05);
      return force.mult(strength);
  }

  update() {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.acc.mult(0);

      this.pos.x = (this.pos.x + width) % width;
      this.pos.y = (this.pos.y + height) % height;
  }

  show() {
      noStroke();
      
      // Draw multiple circles for glow effect
      // Larger circles are more transparent
      // i=3: outer glow
      // i=0: core of particle
      for (let i = 3; i >= 0; i--) {
          let alpha = i === 0 ? 0.8 : 0.3/i;
          let radius = this.size * (i * 2 || 2);
          fill(this.color, 80, 100, alpha);
          ellipse(this.pos.x, this.pos.y, radius);
      }
  }
}