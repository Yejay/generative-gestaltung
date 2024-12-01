const CONFIG = {
    PARTICLE_COUNT: 100,
    STAR_COUNT: 200,
    // FIREWORK_TYPES: ['circle', 'heart', 'spiral', 'text', 'steeringText'],
	FIREWORK_TYPES: [
		'circle', 
		'heart', 
		'spiral', 
		'text', 
		'steeringText', 
		// 'double'
	],
    COLORS: {
        BACKGROUND: [5, 5, 20],
        STARS: [255, 255, 255]
    },
    LAUNCH_CHANCE: 0.03,
    TEXTS: ['★', '♥', '♪', '✨'],
    SOUNDS: {
        // Collection of explosion/impact sounds
        EXPLOSION: [
            'https://assets.mixkit.co/active_storage/sfx/1662/1662-preview.mp3',  // Standard explosion
            'https://assets.mixkit.co/active_storage/sfx/2800/2800-preview.mp3',  // Sparkle burst
            'https://assets.mixkit.co/active_storage/sfx/2801/2801-preview.mp3',  // Flash burst
            'https://assets.mixkit.co/active_storage/sfx/2802/2802-preview.mp3',  // Star burst
            'https://assets.mixkit.co/active_storage/sfx/2809/2809-preview.mp3'   // Flash impact
        ]
    },
    PARTICLE: {
        TRAIL_LENGTH: 5,
        LIFESPAN_DECREASE: 4,
        VELOCITY_RETAIN: 0.95,
        LAUNCH_VELOCITY: {
            MIN: 12,
            MAX: 20
        }
    }
};