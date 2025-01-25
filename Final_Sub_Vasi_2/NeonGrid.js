class NeonGrid {
    constructor() {
        this.cellSize = 50;
        this.offset = 0;
        this.gridColor = colorPalette.getGridColor();
        this.pulseAmount = 0;
    }

    update(audioLevel = 0) {
        this.offset += 0.5;
        if (this.offset > this.cellSize) {
            this.offset = 0;
        }
        
        // Use audio level to affect pulse amount
        this.pulseAmount = lerp(this.pulseAmount, audioLevel * 2, 0.1);
    }

    display() {
        // Draw vertical lines
        for (let x = 0; x < width; x += this.cellSize) {
            let baseAlpha = map(sin(x * 0.01 + this.offset * 0.1), -1, 1, 0.1, 0.5);
            let alpha = baseAlpha * (1 + this.pulseAmount);
            
            stroke(hue(this.gridColor), 
                  saturation(this.gridColor), 
                  brightness(this.gridColor), 
                  alpha);
            strokeWeight(1 + this.pulseAmount);
            line(x, 0, x, height);
        }
        
        // Draw horizontal lines
        for (let y = 0; y < height; y += this.cellSize) {
            let baseAlpha = map(cos(y * 0.01 + this.offset * 0.1), -1, 1, 0.1, 0.5);
            let alpha = baseAlpha * (1 + this.pulseAmount);
            
            stroke(hue(this.gridColor), 
                  saturation(this.gridColor), 
                  brightness(this.gridColor), 
                  alpha);
            strokeWeight(1 + this.pulseAmount);
            line(0, y, width, y);
        }
    }

    resize() {
        // No specific resize behavior needed for grid
    }
}
