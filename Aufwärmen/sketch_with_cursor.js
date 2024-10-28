let noiseFactor = 0.05;  // Control noise scale
let canvasSize = 400;

function setup() {
  createCanvas(canvasSize, canvasSize); 
  // frameRate(10);
  noCursor();
}
  // noLoop() // sodass der Canvas nicht in einem Loop ständig gezeichnet wird
  // updatePixels();
  function draw() {
    background(255);  // Clear background each frame
  
    // First, draw the Perlin Noise background, but make it responsive to mouse movement
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let noiseValue = noise(x * noiseFactor, y * noiseFactor);
        
        // Calculate distance from the mouse
        let d = dist(x, y, mouseX, mouseY);
  
        // Move colors away from the mouse based on distance
        let maxDistance = 100;  // Maximum distance for the effect to apply
        let moveFactor = map(d, 0, maxDistance, 5, 0);  // Move color based on distance from mouse
        
        // Default colors
        let r = noiseValue * 255;
        let g = noiseValue * 100;
        let b = 200;
  
        // Modify the colors based on distance from the mouse
        if (d < maxDistance) {
          r += moveFactor * 30;  // Shift the red channel away from mouse
          g += moveFactor * 20;  // Shift the green channel away from mouse
          b += moveFactor * 10;  // Shift the blue channel away from mouse
        }
  
        // Set pixel color
        stroke(r, g, b, 150);  // Semi-transparent color
        point(x, y);
      }
    }
  
    // Draw the "purple color" at the mouse position
    noStroke();
    fill(150, 0, 255);  // Purple color
    ellipse(mouseX, mouseY, 20, 20);  // The mouse is represented as a purple circle
}
  //
  //
  // noStroke (um Rand vom Kreisen zu entfernen)
  // fill("blue") oder fill(0, 255, 255, 100) - und der letze Wert bestimmt die Intensität (ob durchsichtig oder nicht)
  //
  // let c1 = color(0, 255, 255)
  // let c2 = color(255, 0, 255)
  //
  // fill(c1)
  // circle(windowHeight/2-300, windowWidth/2, 200)
  // 
  // fill(lerpColor(c1, c2, 0.5)) - um eine Mischfarbe zwischen c1 und c2 zu bekommen. Je höher die Zahl desto näher an der andere Farbe
  // circle(windowHeight/2, windowWidth/2, 200)
  //
  // fill(c2)
  // circle(windowHeight/2+300, windowWidth/2, 200)



  // if (mouseIsPressed === true) {
  //   fill(0);
  // } else {
  //   fill(255);
  // }
  // circle(mouseX, mouseY, 100);