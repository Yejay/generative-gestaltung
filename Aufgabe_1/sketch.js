/*
  Inspiration:
  Pexels.com, orange-blue-cloudy-sky
  Bildquelle: https://www.pexels.com/photo/orange-blue-cloudy-sky-158163/
*/

function setup() {
  createCanvas(600, 600);
  pixelDensity(1);
  noLoop();
  
  // Create initial orange background
  background(245, 107, 2, 20);
  
  // Function to create a noise layer
  function createNoiseLayer(noiseScale, col, blendingMode) {
    let layer = createGraphics(width, height);
    layer.pixelDensity(1);
    layer.loadPixels();
    let yoff = 0;
    
    for (let y = 0; y < height; y++) {
      let xoff = 0;
      for (let x = 0; x < width; x++) {
        let index = (x + y * width) * 4;
        let n = noise(xoff, yoff) * 255;
        
        layer.pixels[index + 0] = red(col);
        layer.pixels[index + 1] = green(col);
        layer.pixels[index + 2] = blue(col);
        layer.pixels[index + 3] = (alpha(col) * n) / 255;
        
        xoff += noiseScale;
      }
      yoff += noiseScale;
    }
    
    layer.updatePixels();
    blendMode(blendingMode);
    image(layer, 0, 0);
  }
  
  // Create all layers
  blendMode(BLEND); // Reset blend mode before starting
  createNoiseLayer(0.02, color(0, 3, 181, 100), MULTIPLY);
  createNoiseLayer(0.002, color(190, 9, 9, 90), DARKEST);
  createNoiseLayer(0.002, color(245, 156, 2, 80), LIGHTEST);
  createNoiseLayer(0.01, color(0, 0, 255, 70), SCREEN);
}




