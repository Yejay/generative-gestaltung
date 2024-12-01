class ParticlePool {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.pool = new Array(maxSize).fill(null);
        this.nextAvailable = 0;
        
        // prefill particle pool
        for (let i = 0; i < maxSize; i++) {
            this.pool[i] = new Particle(0, 0, 0, false);
        }
    }

    acquire(x, y, hu, firework, type) {
        // create new particle if pool is exhausted
        if (this.nextAvailable >= this.maxSize) {
            console.warn('Pool erschöpft - erstelle neuen Partikel');
            return new Particle(x, y, hu, firework, type);
        }

        // take particle from pool and initialize it
        const particle = this.pool[this.nextAvailable++];
        particle.reset(x, y, hu, firework, type);
        return particle;
    }

    release(particle) {
        // put particle back into pool
        if (this.nextAvailable <= 0) return;
        
        this.nextAvailable--;
        this.pool[this.nextAvailable] = particle;
    }
}