// star.js
class Star {
    constructor() {
      this.x = random(width);
      this.y = random(height * 0.7); // Only in top 70% of screen
      this.size = random(0.5, 2);
      this.twinkleSpeed = random(0.02, 0.05);
    }
  
    show() {
      let brightness = 150 + 105 * sin(frameCount * this.twinkleSpeed);
      fill(brightness);
      noStroke();
      ellipse(this.x, this.y, this.size);
    }
  }