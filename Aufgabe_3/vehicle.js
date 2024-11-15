class Vehicle {
	constructor(x, y, targetX, targetY) {
		this.pos = createVector(x, y);
		this.vel = p5.Vector.random2D();
		this.acc = createVector();
		this.target = createVector(targetX, targetY);
		this.maxSpeed = random(8, 12);
		this.maxForce = random(0.8, 1.2);
		this.r = random(4, 8);
		this.hue = random(360);
		this.trailPoints = [];
	}

	behaviors() {
		// Calculate all forces
		let forces = {
			arrive: p5.Vector.sub(this.target, this.pos),
			wander: p5.Vector.fromAngle(noise(this.pos.x * 0.01, this.pos.y * 0.01, time) * TWO_PI * 2)
		};

		// Apply arrive force
		let d = forces.arrive.mag();
		let speed = d < 100 ? map(d, 0, 100, 0, this.maxSpeed) : this.maxSpeed;
		forces.arrive.setMag(speed);
		forces.arrive.sub(this.vel).limit(this.maxForce).mult(0.6);

		// Apply forces
		this.acc.add(forces.arrive);
		this.acc.add(forces.wander.mult(0.1));

		// Add mouse interaction if active
		if (forceActive) {
			let mousePos = createVector(mouseX, mouseY);
			let force = p5.Vector.sub(attractMode ? mousePos : this.pos, attractMode ? this.pos : mousePos);
			let d = constrain(force.mag(), 20, 100);
			force.normalize().mult(2.0 / (d * 0.05));
			this.acc.add(force);
		}
	}

	update() {
		// Update position
		this.pos.add(this.vel);
		this.vel.add(this.acc);
		this.vel.limit(this.maxSpeed);
		this.acc.mult(0);

		// Update trail
		this.trailPoints.unshift({ pos: this.pos.copy(), alpha: 1 });
		if (this.trailPoints.length > 10) this.trailPoints.pop();
		this.trailPoints.forEach(point => point.alpha *= 0.8);

		// Wrap around edges
		this.pos.x = (this.pos.x + width) % width;
		this.pos.y = (this.pos.y + height) % height;
	}

	display() {
		noStroke();
		
		// Draw trail
		this.trailPoints.forEach((point, i) => {
			let size = map(i, 0, this.trailPoints.length, this.r, 1);
			fill(this.hue, 80, 100, point.alpha * 0.3);
			ellipse(point.pos.x, point.pos.y, size * 2);
		});

		// Draw particle with glow
		for (let i = 3; i > 0; i--) {
			fill(this.hue, 80, 100, 0.3 / i);
			ellipse(this.pos.x, this.pos.y, this.r * i * 2);
		}

		// Draw core
		fill(this.hue, 80, 100, 0.8);
		ellipse(this.pos.x, this.pos.y, this.r * 2);
	}
}