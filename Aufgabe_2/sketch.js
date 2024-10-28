// // Daniel Shiffman
// // https://thecodingtrain.com/CodingChallenges/024-perlinnoiseflowfield.html

// var inc = 0.1;
// var scl = 10;
// var cols, rows;

// var zoff = 0;

// var fr;

// var particles = [];

// var flowfield;

// function setup() {
//   createCanvas(600, 400);
//   cols = floor(width / scl);
//   rows = floor(height / scl);
//   fr = createP('');

//   flowfield = new Array(cols * rows);

//   for (var i = 0; i < 300; i++) {
//     particles[i] = new Particle();
//   }
//   background(51);
// }

// function draw() {
//   var yoff = 0;
//   for (var y = 0; y < rows; y++) {
//     var xoff = 0;
//     for (var x = 0; x < cols; x++) {
//       var index = x + y * cols;
//       var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
//       var v = p5.Vector.fromAngle(angle);
//       v.setMag(1);
//       flowfield[index] = v;
//       xoff += inc;
//       stroke(0, 50);
//       // push();
//       // translate(x * scl, y * scl);
//       // rotate(v.heading());
//       // strokeWeight(1);
//       // line(0, 0, scl, 0);
//       // pop();
//     }
//     yoff += inc;

//     zoff += 0.0003;
//   }

//   for (var i = 0; i < particles.length; i++) {
//     particles[i].follow(flowfield);
//     particles[i].update();
//     particles[i].edges();
//     particles[i].show();
//   }

//   // fr.html(floor(frameRate()));
// }


// TODO
// Configuration variables
let inc = 0.1;
let scl = 20;
let cols, rows;
let zoff = 0;
let particles = [];
let flowfield;
let bgImage; // Variable to store the background image
let canvasWidth = 600;
let canvasHeight = 400;

function preload() {
  // Load the background image
  // Note: Replace this URL with the actual URL of your alleyway image
  // Image credit: https://picsum.photos/images#2 (Image ID: 57)
  const imageUrl = `https://picsum.photos/id/57/${canvasWidth}/${canvasHeight}`;
  bgImage = loadImage(imageUrl);
}

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);

  flowfield = new Array(cols * rows);

  for (let i = 0; i < 300; i++) {
    particles[i] = new Leaf();
  }
}

function draw() {
  // Draw the background image instead of a solid color
  image(bgImage, 0, 0, width, height);

  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(0.5);
      flowfield[index] = v;

      // Visualize flow field (optional)
      push();
      translate(x * scl, y * scl);
      rotate(v.heading());
      stroke(255, 50);
      line(0, 0, scl, 0);
      pop();

      xoff += inc;
    }
    yoff += inc;
    zoff += 0.0001;
  }

  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }

  // Draw ground (optional, depending on your background image)
  noStroke();
  fill('rgba(101, 67, 33, 0.5)');  // Semi-transparent brown
  rect(0, height - 50, width, 50);
}
