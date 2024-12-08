class Fish {
    constructor(isShark = false) {
        this.pos = createVector(random(width), random(height)); // Random spawn across canvas
        this.vel = p5.Vector.random2D();
        this.acc = createVector();
        this.r = isShark ? 15 : 8;
        this.baseSize = this.r; // Base size for sharks
        this.maxSpeed = isShark ? CONFIG.FISH.DEFAULT_SHARK_SPEED : CONFIG.FISH.DEFAULT_PREY_SPEED;
        this.maxForce = isShark ? 0.3 : 0.15;
        this.isShark = isShark;
        this.health = 100;
        this.eatenCount = 0;
        this.growthStage = 0; // Start with the smallest image
        this.image = isShark ? predatorImages[0] : preyImages[0]; // Assign initial image
        this.bloodSystem = null; // Add blood system for sharks
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

        if (this.isShark && this.bloodSystem) {
            this.bloodSystem.update(); // Update blood particles
        }
    }

    avoidJellyfish(jellyfishes) {
        if (!jellyfishes || jellyfishes.length === 0) return; // Exit if no jellyfishes
        let avoidanceForce = createVector(0, 0);
        let count = 0;
    
        for (let jelly of jellyfishes) {
            let d = p5.Vector.dist(this.pos, jelly.pos);
            if (d < CONFIG.FISH.JELLYFISH_AVOIDANCE + jelly.size) {
                let diff = p5.Vector.sub(this.pos, jelly.pos);
                diff.normalize();
                diff.div(d); // Weight by distance
                avoidanceForce.add(diff);
                count++;
            }
        }
    
        if (count > 0) {
            avoidanceForce.div(count);
            avoidanceForce.setMag(this.maxSpeed);
            avoidanceForce.sub(this.vel);
            avoidanceForce.limit(this.maxForce);
            this.applyForce(avoidanceForce);
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    flock(fishes) {
        let separation = this.separate(fishes).mult(1.5); // Avoid nearby fishes
        let alignment = this.align(fishes).mult(1.0); // Align with nearby fishes
        let cohesion = this.cohere(fishes).mult(1.0); // Move towards the center of nearby fishes

        this.applyForce(separation);
        this.applyForce(alignment);
        this.applyForce(cohesion);
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
            let steer = p5.Vector.sub(nearestPrey.pos, this.pos); // Chase the fish
            steer.setMag(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
            this.applyForce(steer);

            // Eat the fish if too close
            if (shortestDist < this.r + nearestPrey.r) {
                let index = fishes.indexOf(nearestPrey);
                if (index > -1) {
                    // Spawn blood system at the prey's position
                    if (this.isShark) {
                        this.bloodSystem = new BloodSystem(nearestPrey.pos.x, nearestPrey.pos.y);
                        this.bloodSystem.addParticle();
                    }

                    fishes.splice(index, 1); // Remove eaten fish
                    this.eatenCount++; // Increment eaten count

                    // Grow after every 10 eaten fishes
                    if (this.eatenCount >= 10) {
                        this.grow();
                        this.eatenCount = 0; // Reset the counter
                    }
                }
            }
        }
    }

    grow() {
        this.r += 5; // Increase size
        this.maxSpeed *= 0.9; // Slightly slow down as size increases
        if (this.r > 50) {
            this.r = 50; // Cap the size
        }

        // Update growth stage
        if (this.growthStage < predatorImages.length - 1) {
            this.growthStage++;
            this.image = predatorImages[this.growthStage]; // Update to the next image
        }
    }

    separate(fishes) {
        let desiredSeparation = 25;
        let steer = createVector(0, 0);
        let count = 0;

        for (let f of fishes) {
            if (f === this) continue;
            let d = p5.Vector.dist(this.pos, f.pos);
            if (d > 0 && d < desiredSeparation) {
                let diff = p5.Vector.sub(this.pos, f.pos);
                diff.normalize();
                diff.div(d);
                steer.add(diff);
                count++;
            }
        }

        if (count > 0) steer.div(count);

        if (steer.mag() > 0) {
            steer.normalize();
            steer.mult(this.maxSpeed);
            steer.sub(this.vel);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    align(fishes) {
        let neighborDistance = 50;
        let sum = createVector(0, 0);
        let count = 0;

        for (let f of fishes) {
            if (f === this || f.isShark) continue; // Only align with non-sharks
            let d = p5.Vector.dist(this.pos, f.pos);
            if (d > 0 && d < neighborDistance) {
                sum.add(f.vel);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            sum.normalize();
            sum.mult(this.maxSpeed);
            let steer = p5.Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);
            return steer;
        }
        return createVector(0, 0);
    }

    cohere(fishes) {
        let neighborDistance = 50;
        let sum = createVector(0, 0);
        let count = 0;

        for (let f of fishes) {
            if (f === this || f.isShark) continue;
            let d = p5.Vector.dist(this.pos, f.pos);
            if (d > 0 && d < neighborDistance) {
                sum.add(f.pos);
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
        let desired = p5.Vector.sub(target, this.pos);
        desired.normalize();
        desired.mult(this.maxSpeed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);
        return steer;
    }

    edges() {
        if (this.pos.x < -this.r) this.pos.x = width + this.r;
        if (this.pos.x > width + this.r) this.pos.x = -this.r;
        if (this.pos.y < -this.r) this.pos.y = height + this.r;
        if (this.pos.y > height + this.r) this.pos.y = -this.r;
    }


    draw(isNightMode) {
        push();
        translate(this.pos.x, this.pos.y);
        rotate(this.vel.heading());

        if (this.image) {
            // Glow in night mode
            if (isNightMode) {
                drawingContext.shadowBlur = 15;
                drawingContext.shadowColor = this.isShark ? 'red' : 'blue';
            }

            // Draw predator image
            imageMode(CENTER);
            image(this.image, 0, 0, this.r * 2, this.r * 2);
        }
        pop();
        if (this.isShark && this.bloodSystem) {
            this.bloodSystem.draw();
        }
    }
}