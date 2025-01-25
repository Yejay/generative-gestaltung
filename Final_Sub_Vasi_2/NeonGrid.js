class NeonGrid {
    constructor() {
        this.cellSize = 50;
        this.offset = 0;
        this.gridColor = colorPalette.getGridColor();
        this.pulseAmount = 0;
        this.isVisible = false;
        this.lightPoints = [];
        this.reset();
    }

    reset() {
        this.lightPoints = [{
            x: width,
            y: 0,
            direction: 'down',
            intensity: 1,
            splitCount: 0
        }];
        this.completedLines = new Set();
    }

    update(audioLevel = 0) {
        if (!this.isVisible) return;

        this.offset += 0.5;
        if (this.offset > this.cellSize) {
            this.offset = 0;
        }
        
        this.pulseAmount = lerp(this.pulseAmount, audioLevel * 2, 0.1);

        for (let i = this.lightPoints.length - 1; i >= 0; i--) {
            let point = this.lightPoints[i];
            const speed = 5;

            // Move point
            if (point.direction === 'down') {
                point.y += speed;
            } else {
                point.x -= speed;
            }

            if (point.splitCount < 2 && random() < 0.02) {
                let newDirection = point.direction === 'down' ? 'left' : 'down';
                this.lightPoints.push({
                    x: point.x,
                    y: point.y,
                    direction: newDirection,
                    intensity: point.intensity * 0.8,
                    splitCount: point.splitCount + 1
                });
            }

            if (point.x < 0 || point.y > height) {
                this.lightPoints.splice(i, 1);
            }

            let lineKey = point.direction === 'down' 
                ? `v${Math.round(point.x/this.cellSize)}` 
                : `h${Math.round(point.y/this.cellSize)}`;
            this.completedLines.add(lineKey);
        }

        if (this.lightPoints.length === 0 && random() < 0.1) {
            this.lightPoints.push({
                x: width,
                y: 0,
                direction: 'down',
                intensity: 1,
                splitCount: 0
            });
        }
    }

    display() {
        if (!this.isVisible) return;
        for (let x = 0; x < width; x += this.cellSize) {
            let lineKey = `v${Math.round(x/this.cellSize)}`;
            if (this.completedLines.has(lineKey)) {
                let baseAlpha = map(sin(x * 0.01 + this.offset * 0.1), -1, 1, 0.1, 0.5);
                let alpha = baseAlpha * (1 + this.pulseAmount);
                
                stroke(hue(this.gridColor), 
                      saturation(this.gridColor), 
                      brightness(this.gridColor), 
                      alpha);
                strokeWeight(1 + this.pulseAmount);
                line(x, 0, x, height);
            }
        }
        
        for (let y = 0; y < height; y += this.cellSize) {
            let lineKey = `h${Math.round(y/this.cellSize)}`;
            if (this.completedLines.has(lineKey)) {
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

        for (let point of this.lightPoints) {
            noStroke();
            for (let i = 4; i > 0; i--) {
                fill(hue(this.gridColor),
                     saturation(this.gridColor),
                     brightness(this.gridColor),
                     point.intensity * 0.25 / i);
                circle(point.x, point.y, 8 + i * 4);
            }
        }
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.reset();
        }
    }

    resize() {
        this.reset();
    }
}
