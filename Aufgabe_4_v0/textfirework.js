// textfirework.js
class TextFirework extends Firework {
    constructor(text, font, x, y, vx, vy) {
      super(x, y, vx, vy, 'text');
      this.text = text;
      this.font = font;
      this.textParticles = [];
    }
  
    explode() {
      explosionSound.play();
      let fontSize = 60;
      let points = this.font.textToPoints(this.text, 0, 0, fontSize, {
        sampleFactor: 0.1,
        simplifyThreshold: 0
      });
  
      // Calculate text bounds
      let bounds = this.font.textBounds(this.text, 0, 0, fontSize);
      let offsetX = -bounds.w / 2;
      let offsetY = -bounds.h / 2;
  
      for (let p of points) {
        let x = p.x + offsetX + this.firework.pos.x;
        let y = p.y + offsetY + this.firework.pos.y;
        let particle = new Particle(x, y, this.hu, false, 'circle');
        particle.vel = p5.Vector.random2D().mult(random(2, 5));
        this.textParticles.push(particle);
      }
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
  
      for (let i = this.textParticles.length - 1; i >= 0; i--) {
        this.textParticles[i].applyForce(gravity);
        this.textParticles[i].update();
  
        if (this.textParticles[i].done()) {
          this.textParticles.splice(i, 1);
        }
      }
    }
  
    show() {
      if (!this.exploded) {
        this.firework.show();
      }
  
      for (let i = 0; i < this.textParticles.length; i++) {
        this.textParticles[i].show();
      }
    }
  
    done() {
      return this.exploded && this.textParticles.length === 0;
    }
  }