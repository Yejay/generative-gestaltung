const CONFIG = {
    FISH: {
        DEFAULT_PREY_SPEED: 4,
        DEFAULT_SHARK_SPEED: 1,
        DEFAULT_PREY_SIZE: 15,
        DEFAULT_SHARK_SIZE: 30,
        PREY_PERCEPTION: 120,
        SHARK_PERCEPTION: 180,
        INITIAL_PREY_COUNT: 200,
        INITIAL_SHARK_COUNT: 2,
        PREY_TURN_SPEED: 0.08,
        SHARK_TURN_SPEED: 0.05,
        JELLYFISH_AVOIDANCE: 100
    },
    JELLYFISH: {
        COUNT: 5,
        MIN_SIZE: 40,
        MAX_SIZE: 80,
        SPEED: 0.5,
        PULSE_RATE: 0.02
    },
    ENVIRONMENT: {
        WATER_RIPPLE_SPEED: 0.02,
        WATER_RIPPLE_SCALE: 100,
        NIGHT_COLOR: [10, 20, 40],
        DAY_COLOR: [200, 220, 255],
        PLANKTON_DENSITY: 50,
        BUBBLE_RATE: 0.05
    },
    SHARK: {
        MAX_STAMINA: 100,
        STAMINA_RECOVERY_RATE: 0.2,
        SPRINT_COST: 1
    }
};