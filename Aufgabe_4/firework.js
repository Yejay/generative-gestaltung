class Firework {
    constructor(x, y, type = random(CONFIG.FIREWORK_TYPES)) {
        if (!particlePool) {
            particlePool = new ParticlePool(2000);
        }
        
        this.type = type;
        this.hu = random(255);
        x = constrain(x, width * 0.1, width * 0.9);
        this.firework = particlePool.acquire(x, y, this.hu, true, type);
        this.exploded = false;
        this.particles = [];
        
        this.hasSecondaryExplosion = random() < 0.3;
        this.secondaryExplosionTimer = random(20, 40);
        this.sparkTrail = random() < 0.4;
        this.rotationAngle = 0;
        this.rotationSpeed = random(-0.1, 0.1);
        this.colorShift = random() < 0.3;
        this.colorShiftSpeed = random(2, 5);
    }

    createNormalParticles(count) {
        for (let i = 0; i < count; i++) {
            const p = particlePool.acquire(
                this.firework.pos.x,
                this.firework.pos.y,
                this.hu,
                false,
                'circle'
            );
            // Add some randomness to the explosion
            const angle = random(TWO_PI);
            const speed = random(2, 8);
            p.vel = p5.Vector.fromAngle(angle).mult(speed);
            this.particles.push(p);
        }
    }

    explode() {
        const explosionIndex = floor(random(explosionSounds.length));
        explosionSounds[explosionIndex].play();

        if (this.type === 'steeringText') {
            let points = this.createTextPoints();
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
                this.createNormalParticles(CONFIG.PARTICLE_COUNT);
            }
        } else {
            this.createEnhancedParticles();
        }
    }

    createTextPoints() {
        let points = [];
        let txt = random(['BOOM', 'POW', 'WOW', 'BAM', '2024']);
        let fontSize = 120;

        let bounds = textFont.textBounds(txt, 0, 0, fontSize);
        let centerX = this.firework.pos.x - bounds.w / 2;
        let centerY = this.firework.pos.y + bounds.h / 2;

        points = textFont.textToPoints(txt, centerX, centerY, fontSize, {
            sampleFactor: 0.1,
            simplifyThreshold: 0
        });

        points = points.map((p) => ({
            x: p.x,
            y: p.y,
        }));

        if (points.length > 300) {
            points = shuffle(points).slice(0, 300);
        }

        return points;
    }

	createEnhancedParticles() {
		const particleCount = this.type === 'text' ? 50 : CONFIG.PARTICLE_COUNT;
		
		switch(this.type) {
			case 'spiral':
				this.createSpiralParticles(particleCount);
				break;
			case 'heart':
				this.createHeartParticles(particleCount);
				break;
			case 'double':
				this.createDoubleRingParticles(particleCount);
				break;
			case 'text':
				// Create a circular explosion pattern but with text particles
				for (let i = 0; i < particleCount; i++) {
					const p = particlePool.acquire(
						this.firework.pos.x,
						this.firework.pos.y,
						this.hu,
						false,
						'text'  // This ensures the particle will use drawText()
					);
					const angle = random(TWO_PI);
					const speed = random(2, 6);
					p.vel = p5.Vector.fromAngle(angle).mult(speed);
					this.particles.push(p);
				}
				break;
			default:
				this.createNormalParticles(particleCount);
		}
	}

    createSpiralParticles(count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * TWO_PI * 3;
            const r = map(i, 0, count, 0, 50);
            const x = this.firework.pos.x + cos(angle) * r;
            const y = this.firework.pos.y + sin(angle) * r;
            const p = particlePool.acquire(x, y, this.hu, false, 'spiral');
            p.vel = p5.Vector.fromAngle(angle).mult(random(2, 5));
            this.particles.push(p);
        }
    }

    createHeartParticles(count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * TWO_PI;
            const r = 30 * (1 - sin(angle));
            const x = this.firework.pos.x + r * cos(angle);
            const y = this.firework.pos.y + r * sin(angle);
            const p = particlePool.acquire(x, y, this.hu, false, 'heart');
            this.particles.push(p);
        }
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();
            
            if (this.sparkTrail && frameCount % 2 === 0) {
                this.createSparkTrail();
            }

            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.applyForce(gravity);
            
            if (this.type !== 'steeringText') {
                this.rotationAngle += this.rotationSpeed;
                const rotForce = createVector(cos(this.rotationAngle), sin(this.rotationAngle));
                rotForce.mult(0.1);
                particle.applyForce(rotForce);
            }
            
            if (this.colorShift) {
                particle.hu = (particle.hu + this.colorShiftSpeed) % 255;
            }

            particle.update();

            if (particle.done()) {
                if (this.hasSecondaryExplosion && 
                    this.secondaryExplosionTimer-- <= 0 && 
                    i === this.particles.length - 1) {
                    this.createSecondaryExplosion(particle.pos.x, particle.pos.y);
                }
                
                this.particles.splice(i, 1);
            }
        }
    }

    createSparkTrail() {
        const sparkParticle = particlePool.acquire(
            this.firework.pos.x,
            this.firework.pos.y,
            this.hu,
            false,
            'spark'
        );
        sparkParticle.lifespan = 100;
        this.particles.push(sparkParticle);
    }

    createSecondaryExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            const angle = random(TWO_PI);
            const p = particlePool.acquire(x, y, this.hu, false, 'circle');
            p.vel = p5.Vector.fromAngle(angle).mult(random(1, 3));
            p.lifespan = 150;
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }

        for (let particle of this.particles) {
            if (this.type === 'spiral' || this.type === 'double') {
                blendMode(ADD);
                particle.show();
                blendMode(BLEND);
            } else {
                particle.show();
            }
            
            if (this.type === 'double' && this.particles.length > 1) {
                let nextParticle = this.particles[(this.particles.indexOf(particle) + 1) % this.particles.length];
                stroke(particle.hu, 255, 255, particle.lifespan * 0.5);
                strokeWeight(0.5);
                line(particle.pos.x, particle.pos.y, nextParticle.pos.x, nextParticle.pos.y);
            }
        }
    }

    done() {
        if (this.exploded) {
            for (let i = this.particles.length - 1; i >= 0; i--) {
                if (this.particles[i].done()) {
                    particlePool.release(this.particles[i]);
                    this.particles.splice(i, 1);
                }
            }
        }
        return this.exploded && this.particles.length === 0;
    }
}