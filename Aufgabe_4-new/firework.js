// class Firework {
// 	constructor(x, y, type = random(CONFIG.FIREWORK_TYPES)) {
// 		this.type = type;
// 		this.hu = random(255);
// 		this.firework = new Particle(x, y, this.hu, true, type);
// 		this.exploded = false;
// 		this.particles = [];
// 	}

// 	explode() {
// 		// Pick a random explosion sound
// 		const explosionIndex = floor(random(explosionSounds.length));
// 		explosionSounds[explosionIndex].play();

// 		const particleCount = this.type === 'text' ? 50 : CONFIG.PARTICLE_COUNT;

// 		for (let i = 0; i < particleCount; i++) {
// 			const p = new Particle(
// 				this.firework.pos.x,
// 				this.firework.pos.y,
// 				this.hu,
// 				false,
// 				this.type
// 			);
// 			this.particles.push(p);
// 		}
// 	}

// 	done() {
// 		return this.exploded && this.particles.length === 0;
// 	}

// 	update() {
// 		if (!this.exploded) {
// 			this.firework.applyForce(gravity);
// 			this.firework.update();

// 			if (this.firework.vel.y >= 0) {
// 				this.exploded = true;
// 				this.explode();
// 			}
// 		}

// 		for (let i = this.particles.length - 1; i >= 0; i--) {
// 			this.particles[i].applyForce(gravity);
// 			this.particles[i].update();

// 			if (this.particles[i].done()) {
// 				this.particles.splice(i, 1);
// 			}
// 		}
// 	}

// 	show() {
// 		if (!this.exploded) {
// 			this.firework.show();
// 		}

// 		for (let particle of this.particles) {
// 			particle.show();
// 		}
// 	}
// }

class Firework {
	constructor(x, y, type = random(CONFIG.FIREWORK_TYPES)) {
        this.type = type;
        this.hu = random(255);
        this.firework = new Particle(x, y, this.hu, true, type);
        this.exploded = false;
        this.particles = [];
    }

    explode() {
        // Pick a random explosion sound
        const explosionIndex = floor(random(explosionSounds.length));
        explosionSounds[explosionIndex].play();

        if (this.type === 'steeringText') {
            let points = this.createTextPoints();
            console.log("Generated points:", points.length);
            
            // Only create steering particles if we have points
            if (points.length > 0) {
                for (let point of points) {
                    const p = new SteeringParticle(
                        this.firework.pos.x,
                        this.firework.pos.y,
                        point.x,
                        point.y,
                        this.hu
                    );
                    this.particles.push(p);
                }
            } else {
                // Fallback to normal particles if no points generated
                this.createNormalParticles();
            }
        } else {
            this.createNormalParticles();
        }
    }

    createNormalParticles() {
        const particleCount = this.type === 'text' ? 50 : CONFIG.PARTICLE_COUNT;
        for (let i = 0; i < particleCount; i++) {
            const p = new Particle(
                this.firework.pos.x,
                this.firework.pos.y,
                this.hu,
                false,
                this.type
            );
            this.particles.push(p);
        }
    }

    createTextPoints() {
        let points = [];
        let txt = random(['BOOM', 'POW', 'WOW', 'BAM', '2024']);
        let fontSize = 120;
        
        console.log("Creating text:", txt);
        
        // Calculate text boundaries for centering
        let bounds = textFont.textBounds(txt, 0, 0, fontSize);
        let centerX = this.firework.pos.x - bounds.w/2;
        let centerY = this.firework.pos.y + bounds.h/2;
        
        // Get points from font
        points = textFont.textToPoints(txt, centerX, centerY, fontSize, {
            sampleFactor: 0.1,
            simplifyThreshold: 0
        });
        
        // Convert points to the format our SteeringParticle expects
        points = points.map(p => ({
            x: p.x,
            y: p.y
        }));
        
        // Limit number of points if needed
        if (points.length > 300) {
            points = shuffle(points).slice(0, 300);
        }
        
        console.log("Generated points:", points.length);
        return points;
    }

    
	// createTextPoints() {
    //     let points = [];
    //     let fontSize = 80;
    //     let txt = random(['BOOM', 'POW', 'WOW', 'BAM', '2024']);
        
    //     console.log("Creating text:", txt);
        
    //     // Create graphics buffer
    //     let graphics = createGraphics(400, 200);
    //     graphics.background(0);
    //     graphics.fill(255);
    //     graphics.noStroke();
    //     graphics.textSize(fontSize);
    //     graphics.textAlign(CENTER, CENTER);
    //     graphics.text(txt, graphics.width/2, graphics.height/2);
        
    //     // Debug: draw the graphics buffer to screen temporarily
    //     image(graphics, 0, 0);
        
    //     graphics.loadPixels();
        
    //     // Debug: check if pixels are loaded
    //     console.log("Pixels loaded:", graphics.pixels ? "yes" : "no");
    //     console.log("Pixels length:", graphics.pixels.length);
        
    //     // Sample points
    //     for (let i = 0; i < graphics.width; i += 2) {
    //         for (let j = 0; j < graphics.height; j += 2) {
    //             let index = (i + j * graphics.width) * 4;
    //             // Debug: log some pixel values
    //             if (i === 0 && j === 0) {
    //                 console.log("First pixel values:", 
    //                     graphics.pixels[index],
    //                     graphics.pixels[index + 1],
    //                     graphics.pixels[index + 2],
    //                     graphics.pixels[index + 3]
    //                 );
    //             }
                
    //             if (graphics.pixels[index] > 128) {
    //                 points.push({
    //                     x: this.firework.pos.x - graphics.width/2 + i,
    //                     y: this.firework.pos.y - graphics.height/2 + j
    //                 });
    //             }
    //         }
    //     }
        
    //     console.log("Found points:", points.length);
        
    //     // If no points found, try with different channel
    //     if (points.length === 0) {
    //         points = [];
    //         for (let i = 0; i < graphics.width; i += 2) {
    //             for (let j = 0; j < graphics.height; j += 2) {
    //                 let index = (i + j * graphics.width) * 4;
    //                 if (graphics.pixels[index + 3] > 128) { // Check alpha channel instead
    //                     points.push({
    //                         x: this.firework.pos.x - graphics.width/2 + i,
    //                         y: this.firework.pos.y - graphics.height/2 + j
    //                     });
    //                 }
    //             }
    //         }
    //         console.log("Points after alpha check:", points.length);
    //     }
        
    //     if (points.length > 300) {
    //         points = shuffle(points).slice(0, 300);
    //     }
        
    //     return points;
    // }

	done() {
		return this.exploded && this.particles.length === 0;
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

		for (let i = this.particles.length - 1; i >= 0; i--) {
			this.particles[i].applyForce(gravity);
			this.particles[i].update();

			if (this.particles[i].done()) {
				this.particles.splice(i, 1);
			}
		}
	}

	show() {
		if (!this.exploded) {
			this.firework.show();
		}

		for (let particle of this.particles) {
			particle.show();
		}
	}
}
