let buildings = [];

function createCityscape() {
    const img = createGraphics(width, height/2.5);
    img.fill(20);
    img.noStroke();
    
    // Only create buildings once if they don't exist
    if (buildings.length === 0) {
        for (let x = 0; x < width; x += random(60, 120)) {
            const building = {
                x: x,
                width: random(40, 100),
                height: random(img.height * 0.3, img.height * 0.9),
                windows: []
            };
            
            const windowSize = 8;
            const windowSpacing = 15;
            const windowMargin = 10;
            
            const windowCols = floor((building.width - 2 * windowMargin) / windowSpacing);
            const windowRows = floor((building.height - 2 * windowMargin) / windowSpacing);
            
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    building.windows.push({
                        x: building.x + windowMargin + col * windowSpacing,
                        y: img.height - building.height + windowMargin + row * windowSpacing,
                        isLit: random() < 0.7,
                        lastChange: random(0, 1000)
                    });
                }
            }
            buildings.push(building);
        }
    }
    
    // Draw buildings
    for (let building of buildings) {
        img.rect(building.x, img.height - building.height, building.width, building.height);
        
        const windowSize = 8;
        for (let window of building.windows) {
            // Only update windows occasionally
            if (frameCount - window.lastChange > 1000 && random() < 0.001) {
                window.isLit = !window.isLit;
                window.lastChange = frameCount;
            }
            
            if (window.isLit) {
                img.fill(255, 255, 0, random(40, 120));
                img.rect(window.x, window.y, windowSize, windowSize);
                img.fill(20);
            }
        }
    }
    
    return img;
}