class Fish {
	constructor(isShark = false) {
		this.pos = createVector(random(width), random(height));
		this.vel = p5.Vector.random2D();
		this.acc = createVector();
		this.r = isShark ? 15 : 8; // Size based on type
		this.maxSpeed = isShark
			? CONFIG.FISH.DEFAULT_SHARK_SPEED
			: CONFIG.FISH.DEFAULT_PREY_SPEED; // Slider controlled
		this.maxForce = isShark ? 0.3 : 0.15;
		this.isShark = isShark;
		this.health = 100;
		this.image = isShark ? predatorImages[0] : preyImages[0]; // Image for visualization
		this.tailAngle = 0;
		this.tailSpeed = 0.1;
	}

	update(fishes, jellyfishes) {
		if (this.isShark) {
			this.hunt(fishes);
		} else {
			this.flock(fishes);
		}

		this.avoidJellyfish(jellyfishes);
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.pos.add(this.vel);
		this.acc.mult(0); // Reset acceleration
		this.edges();

		// Update blood system
		if (this.isShark && this.bloodSystem) {
			this.bloodSystem.update();
		}
	}

	draw() {
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());

		// Tail animation
		this.tailAngle = sin(frameCount * this.tailSpeed) * 0.3;

		if (this.image) {
			drawingContext.shadowBlur = 15;
			drawingContext.shadowColor = this.isShark ? 'red' : 'blue';

			// Draw body
			imageMode(CENTER);
			image(this.image, 0, 0, this.r * 2, this.r * 2);

			// Draw animated tail
			push();
			rotate(this.tailAngle);
			// Draw tail implementation
			pop();
		}
		pop();

		// Draw the blood system
		if (this.isShark && this.bloodSystem) {
			this.bloodSystem.draw();
		}
	}

	applyForce(force) {
		this.acc.add(force);
	}

	flock(fishes) {
		let sep = this.separate(fishes).mult(separationWeight); // Separation
		let ali = this.align(fishes).mult(alignmentWeight); // Alignment
		let coh = this.cohere(fishes).mult(cohesionWeight); // Cohesion

		this.applyForce(sep);
		this.applyForce(ali);
		this.applyForce(coh);
	}

	hunt(fishes) {
		let nearestPrey = null;
		let shortestDist = CONFIG.FISH.SHARK_PERCEPTION;

		for (let f of fishes) {
			if (f.isShark) continue; // Sharks don't hunt other sharks
			let d = p5.Vector.dist(this.pos, f.pos);
			if (d < shortestDist) {
				shortestDist = d;
				nearestPrey = f;
			}
		}

		if (nearestPrey) {
			let steer = p5.Vector.sub(nearestPrey.pos, this.pos); // Vector toward prey
			steer.setMag(this.maxSpeed);
			steer.sub(this.vel);
			steer.limit(this.maxForce);
			this.applyForce(steer);

			// Eat the prey if close enough
			if (shortestDist < this.r + nearestPrey.r) {
				let index = fishes.indexOf(nearestPrey);
				if (index > -1) {
					// Initialize BloodSystem if not already done
					if (!this.bloodSystem) {
						this.bloodSystem = new BloodSystem(
							nearestPrey.pos.x,
							nearestPrey.pos.y
						);
					}
					// Update BloodSystem origin to prey position
					this.bloodSystem.origin.set(nearestPrey.pos.x, nearestPrey.pos.y);
					// Add particles to the blood system
					this.bloodSystem.addParticle();

					fishes.splice(index, 1); // Remove prey
					this.eatenCount++;
					if (this.eatenCount >= 10) {
						this.grow();
						this.eatenCount = 0;
					}
				}
			}
		} else {
			this.wander();
		}
	}

	wander() {
		// Wandering parameters
		let wanderStrength = 0.1; // The intensity of the random movement
		let randomSteer = p5.Vector.random2D(); // Generate a random direction
		randomSteer.mult(wanderStrength); // Scale the randomness

		// Apply the random steering force
		this.applyForce(randomSteer);

		// Slightly limit velocity to prevent excessive drifting
		this.vel.limit(this.maxSpeed * 0.9);
	}

	avoidJellyfish(jellyfishes) {
		let steer = createVector(0, 0);
		let count = 0;

		for (let jelly of jellyfishes) {
			let d = p5.Vector.dist(this.pos, jelly.pos);
			if (d < CONFIG.FISH.JELLYFISH_AVOIDANCE + jelly.size) {
				let diff = p5.Vector.sub(this.pos, jelly.pos).normalize().div(d);
				steer.add(diff);
				count++;
			}
		}

		if (count > 0) {
			steer.div(count).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
			this.applyForce(steer);
		}
	}

	separate(fishes) {
		let desiredSeparation = 25;
		let steer = createVector(0, 0);
		let count = 0;

		for (let fish of fishes) {
			let d = p5.Vector.dist(this.pos, fish.pos);
			if (d > 0 && d < desiredSeparation) {
				let diff = p5.Vector.sub(this.pos, fish.pos).normalize().div(d);
				steer.add(diff);
				count++;
			}
		}

		if (count > 0)
			steer.div(count).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
		return steer;
	}

	align(fishes) {
		let neighborDist = 50;
		let sum = createVector(0, 0);
		let count = 0;

		for (let fish of fishes) {
			let d = p5.Vector.dist(this.pos, fish.pos);
			if (d > 0 && d < neighborDist && !fish.isShark) {
				sum.add(fish.vel);
				count++;
			}
		}

		if (count > 0)
			sum.div(count).setMag(this.maxSpeed).sub(this.vel).limit(this.maxForce);
		return sum;
	}

	cohere(fishes) {
		let neighborDist = 50;
		let sum = createVector(0, 0);
		let count = 0;

		for (let fish of fishes) {
			let d = p5.Vector.dist(this.pos, fish.pos);
			if (d > 0 && d < neighborDist && !fish.isShark) {
				sum.add(fish.pos);
				count++;
			}
		}

		if (count > 0) {
			sum.div(count);
			return this.seek(sum);
		}
		return createVector(0, 0);
	}

	seek(target) {
		let desired = p5.Vector.sub(target, this.pos).setMag(this.maxSpeed);
		let steer = p5.Vector.sub(desired, this.vel).limit(this.maxForce);
		return steer;
	}

	edges() {
		if (this.pos.x < -this.r) this.pos.x = width + this.r;
		if (this.pos.x > width + this.r) this.pos.x = -this.r;
		if (this.pos.y < -this.r) this.pos.y = height + this.r;
		if (this.pos.y > height + this.r) this.pos.y = -this.r;
	}

	draw() {
		push();
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());

		if (this.image) {
			drawingContext.shadowBlur = 15;
			drawingContext.shadowColor = this.isShark ? 'red' : 'blue';

			imageMode(CENTER);
			image(this.image, 0, 0, this.r * 2, this.r * 2);
		}
		pop();

		// Draw the blood system
		if (this.isShark && this.bloodSystem) {
			this.bloodSystem.draw();
		}
	}

	flee(predators) {
		let escape = createVector(0, 0);
		let count = 0;

		for (let predator of predators) {
			if (!predator.isShark) continue;

			let d = p5.Vector.dist(this.pos, predator.pos);
			if (d < CONFIG.FISH.PREY_PERCEPTION) {
				let diff = p5.Vector.sub(this.pos, predator.pos);
				diff.normalize();
				diff.div(d); // Closer predators have stronger influence
				escape.add(diff);
				count++;

				// Burst of speed when very close to predator
				if (d < CONFIG.FISH.PREY_PERCEPTION * 0.3) {
					this.maxSpeed *= 1.5;
				}
			}
		}

		if (count > 0) {
			escape.div(count);
			escape.setMag(this.maxSpeed);
			return escape;
		}
		return createVector(0, 0);
	}
}
