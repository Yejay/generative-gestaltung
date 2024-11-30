class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(0.5, 2);
        this.twinkleSpeed = random(0.02, 0.05);
        this.angle = random(TWO_PI);
    }
    
    show() {
        this.angle += this.twinkleSpeed;
        const twinkle = map(sin(this.angle), -1, 1, 0.5, 1);
        
        fill(255, 255, 255, 255 * twinkle);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}