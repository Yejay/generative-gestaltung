class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = 0.5;
        this.soundsEnabled = false;
        this.loadingComplete = false;
    }

    preload() {
        console.log('Bypassing sound preload for debugging.');
        this.loadingComplete = true;
    }

    setVolume(volume) {
        if (!this.soundsEnabled) return;
        
        this.volume = volume;
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.setVolume) {
                sound.setVolume(volume);
            }
        });
    }

    playSound(name) {
        if (!this.soundsEnabled) return;
        
        const sound = this.sounds[name];
        if (sound) {
            if (name !== 'ambient' && sound.isPlaying && sound.isPlaying()) {
                sound.stop();
            }
            if (sound.play) {
                sound.play();
            }
        }
    }

    startAmbient() {
        if (!this.soundsEnabled) return;
        
        const ambient = this.sounds.ambient;
        if (ambient && !ambient.isPlaying()) {
            ambient.setVolume(this.volume * 0.3);
            ambient.loop();
        }
    }

    stopAll() {
        if (!this.soundsEnabled) return;
        
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.isPlaying()) {
                sound.stop();
            }
        });
    }
}