var tex

function setup() {
  createCanvas(windowWidth, windowHeight); 
  pixelDensity(1) // es muss vor loadPixels kommen, sonst wird es nicht funktionieren
  // callback um Ränder zu vermeiden beim resizen
  // noLoop() sodass der Canvas nicht in einem Loop ständig gezeichnet wird

  tex = createImage(400, 400)
  tex.loadPixels()
  for(let y = 0; y < tex.width; y++){
    for(let x = 0; x < tex.height; x++){
      let index = 4 * (y * tex.width +x);
      pixels[index+0]= map(x, 0, tex.width, 0, 255)
      pixels[index+1]= map(y, 0, tex.height, 0, 255)
      pixels[index+2]= 0
      pixels[index+3]= 255
    }
  }
  tex.updatePixels()
}

function draw() {
  background("green");

  image(tex, mouseX, mouseY)
  // blendMode(DIFFERENCE) um blendmodes zu benutzen
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
}