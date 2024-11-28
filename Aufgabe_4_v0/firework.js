// firework.js
class Firework {
  constructor(x, y, vx, vy, shape) {
    this.hu = random(360); // Use full HSB color spectrum
    this.firework = new Particle(x, y, this.hu, true);
    this.firework.vel.set(vx || random(-2, 2), vy || random(-12, -8));
    this.exploded = false;
    this.particles = [];
    this.shape = shape || random(['circle', 'heart', 'star', 'spiral']);
    this.hasSecondaryExplosion = random() < 0.3;
  }

  done() {
    return this.exploded && this.particles.length === 0;
  }

  update() {
    if (!this.exploded) {
      this.firework.applyForce(gravity);
      this.firework.update();

      if (this.firework.vel.y >= 0) {
        this.exploded = true;
        this.explode();
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].applyForce(gravity);
      this.particles[i].update();

      if (this.particles[i].done()) {
        this.particles.splice(i, 1);
      }
    }

    if (this.hasSecondaryExplosion && this.exploded && frameCount % 20 === 0 && this.particles.length > 0) {
      this.secondaryExplode();
    }
  }

  explode() {
    explosionSound.play();
    let particleCount = 100;
    for (let i = 0; i < particleCount; i++) {
      const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false, this.shape);
      this.particles.push(p);
    }
  }

  secondaryExplode() {
    for (let i = 0; i < 20; i++) {
      const p = new Particle(
        this.firework.pos.x + random(-50, 50),
        this.firework.pos.y + random(-50, 50),
        (this.hu + random(-20, 20) + 360) % 360,
        false,
        'circle'
      );
      this.particles.push(p);
    }
  }

  show() {
    if (!this.exploded) {
      this.firework.show();
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].show();
    }
  }
}