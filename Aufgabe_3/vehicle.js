class Vehicle {
  constructor(x, y, targetX, targetY) {
      // Create starting position vector from x,y coordinates
      this.pos = createVector(x, y);
      // Random initial velocity (direction) with magnitude of 1
      this.vel = p5.Vector.random2D();
      // Empty acceleration vector to store forces
      this.acc = createVector();
      // Target position where the particle wants to go
      this.target = createVector(targetX, targetY);
      // Random speed limit between 8 and 12
      this.maxSpeed = random(8, 12);
      // Random steering force limit between 0.8 and 1.2
      this.maxForce = random(0.8, 1.2);
      // Random particle size between 4 and 8
      this.size = random(4, 8);
      // Random HSB color hue (0-360)
      this.color = random(360);
  }

  move() {
      // Calculate and apply three types of forces:

      // 1. Force that pulls particle toward its target position
      let targetForce = this.getTargetForce();
      this.acc.add(targetForce);

      // 2. Random wandering force for organic movement
      let wanderForce = this.getWanderForce();
      this.acc.add(wanderForce);

      // 3. Mouse interaction force (attract or repel) when active
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
      // Limit force and reduce strength to 60%
      return steer.limit(this.maxForce).mult(0.6);
  }

  getWanderForce() {
      // Use Perlin noise to generate smooth random movement
      // Position and time affect the noise value
      // Returns a vector with random angle and small magnitude
      return p5.Vector.fromAngle(
          noise(this.pos.x * 0.01, this.pos.y * 0.01, time) * TWO_PI * 2
      ).mult(0.1);
  }

  getMouseForce() {
      // Get vector pointing from particle to mouse
      let mousePos = createVector(mouseX, mouseY);
      let force = p5.Vector.sub(mousePos, this.pos);
      // Constrain distance to prevent extreme forces
      let distance = constrain(force.mag(), 20, 100);
      
      // Reverse force direction if in repel mode
      if (!attractMode) {
          force.mult(-1);
      }
      
      // Normalize force and apply inverse square law
      force.normalize();
      let strength = 2.0 / (distance * 0.05);
      return force.mult(strength);
  }

  update() {
      // Apply physics: add velocity to position
      this.pos.add(this.vel);
      // Add acceleration to velocity
      this.vel.add(this.acc);
      // Limit speed to maxSpeed
      this.vel.limit(this.maxSpeed);
      // Reset acceleration
      this.acc.mult(0);

      // Wrap around screen edges
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
          // Calculate transparency (alpha)
          let alpha = i === 0 ? 0.8 : 0.3/i;
          // Calculate circle size
          let radius = this.size * (i * 2 || 2);
          // Set color with calculated alpha
          fill(this.color, 80, 100, alpha);
          // Draw circle
          ellipse(this.pos.x, this.pos.y, radius);
      }
  }
}