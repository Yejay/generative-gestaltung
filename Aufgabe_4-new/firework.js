class Firework {
	constructor(x, y, type = random(CONFIG.FIREWORK_TYPES)) {
        this.type = type;
        this.hu = random(255);
        // Constrain initial x position
        x = constrain(x, width * 0.1, width * 0.9);
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
			console.log('Generated points:', points.length);

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

		console.log('Creating text:', txt);

		// Calculate text boundaries for centering
		let bounds = textFont.textBounds(txt, 0, 0, fontSize);
		let centerX = this.firework.pos.x - bounds.w / 2;
		let centerY = this.firework.pos.y + bounds.h / 2;

		// Get points from font
		points = textFont.textToPoints(txt, centerX, centerY, fontSize, {
			sampleFactor: 0.1,
			simplifyThreshold: 0,
		});

		// Convert points to the format our SteeringParticle expects
		points = points.map((p) => ({
			x: p.x,
			y: p.y,
		}));

		// Limit number of points if needed
		if (points.length > 300) {
			points = shuffle(points).slice(0, 300);
		}

		console.log('Generated points:', points.length);
		return points;
	}

	done() {
		return this.exploded && this.particles.length === 0;
	}

	// update() {
	// 	if (!this.exploded) {
	// 		this.firework.applyForce(gravity);
	// 		this.firework.update();

	// 		// Add boundary checks for initial launch
	// 		this.firework.pos.x = constrain(this.firework.pos.x, 0, width);

	// 		if (this.firework.vel.y >= 0) {
	// 			this.exploded = true;
	// 			this.explode();
	// 		}
	// 	}

	// 	for (let i = this.particles.length - 1; i >= 0; i--) {
	// 		this.particles[i].applyForce(gravity);
	// 		this.particles[i].update();

	// 		// Add boundary checks for explosion particles
	// 		if (this.particles[i].pos) {
	// 			// Check if pos exists
	// 			this.particles[i].pos.x = constrain(this.particles[i].pos.x, 0, width);
	// 			this.particles[i].pos.y = constrain(this.particles[i].pos.y, 0, height);
	// 		}

	// 		if (this.particles[i].done()) {
	// 			this.particles.splice(i, 1);
	// 		}
	// 	}
	// }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
    
            // Add boundary checks for initial launch
            if (this.firework.pos) {  // Safety check
                this.firework.pos.x = constrain(this.firework.pos.x, 0, width);
                // Maybe add a height limit for initial launch
                this.firework.pos.y = constrain(this.firework.pos.y, 0, height * 0.8);
            }
    
            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }
    
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
    
            // Add boundary checks for explosion particles
            let particle = this.particles[i];
            if (particle.pos) {  // Safety check
                particle.pos.x = constrain(particle.pos.x, 0, width);
                particle.pos.y = constrain(particle.pos.y, 0, height);
            }
    
            if (particle.done()) {
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
