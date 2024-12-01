class ParticlePool {
    constructor(maxSize = 1000) {
        this.maxSize = maxSize;
        this.pool = new Array(maxSize).fill(null);
        this.nextAvailable = 0;
        
        // Vorfüllen des Pools
        for (let i = 0; i < maxSize; i++) {
            this.pool[i] = new Particle(0, 0, 0, false);
        }
    }

    acquire(x, y, hu, firework, type) {
        // Wenn Pool leer, erstelle neuen Partikel
        if (this.nextAvailable >= this.maxSize) {
            console.warn('Pool erschöpft - erstelle neuen Partikel');
            return new Particle(x, y, hu, firework, type);
        }

        // Nimm Partikel aus Pool und initialisiere ihn neu
        const particle = this.pool[this.nextAvailable++];
        particle.reset(x, y, hu, firework, type);
        return particle;
    }

    release(particle) {
        // Gebe Partikel zurück in den Pool
        if (this.nextAvailable <= 0) return;
        
        this.nextAvailable--;
        this.pool[this.nextAvailable] = particle;
    }
}