class UI {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.panel = this.setupUI();
        colorMode(RGB);
    }

    setupUI() {
        let panel = createDiv('');
        panel.class('control-panel');

        // Stats container
        this.statsDiv = createDiv('');
        this.statsDiv.class('stats');
        this.statsDiv.parent(panel);

        // Controls container
        let controlsDiv = createDiv('');
        controlsDiv.class('controls');
        controlsDiv.parent(panel);

        // Sliders
        this.createSlider(controlsDiv, 'Fish Speed', 1, 5, 2, 0.1, 
            value => this.callbacks.onFishSpeedChange(value));
        this.createSlider(controlsDiv, 'Shark Speed', 1, 5, 3, 0.1,
            value => this.callbacks.onSharkSpeedChange(value));
        this.createSlider(controlsDiv, 'Volume', 0, 1, 0.5, 0.1,
            value => this.callbacks.onVolumeChange(value));

        // Buttons container
        let buttonDiv = createDiv('');
        buttonDiv.class('button-container');
        buttonDiv.parent(controlsDiv);

        // Create buttons
        this.createButton(buttonDiv, '🐟 Add Fish', () => this.callbacks.onAddFish());
        this.createButton(buttonDiv, '🦈 Add Shark', () => this.callbacks.onAddShark());
        this.createButton(buttonDiv, '🎐 Add Jellyfish', () => this.callbacks.onAddJellyfish());
        this.createButton(buttonDiv, '🌙 Toggle Night Mode', () => this.callbacks.onNightModeToggle());
        this.createButton(buttonDiv, '🔄 Reset', () => this.callbacks.onReset());

        return panel;
    }

    createSlider(parent, label, min, max, value, step, callback) {
        let container = createDiv('');
        container.class('slider-container');
        container.parent(parent);

        createSpan(label).parent(container);
        
        let slider = createSlider(min, max, value, step);
        slider.input(() => callback(slider.value()));
        slider.parent(container);
        
        let valueDisplay = createSpan(value.toFixed(1));
        valueDisplay.parent(container);
        slider.input(() => valueDisplay.html(slider.value().toFixed(1)));
    }

    createButton(parent, label, callback) {
        let btn = createButton(label);
        btn.parent(parent);
        btn.mousePressed(callback);
        return btn;
    }

    updateStats(stats) {
        this.statsDiv.html(`
            <div class="stat">🐟 Fish: ${stats.fishCount}</div>
            <div class="stat">🦈 Sharks: ${stats.sharkCount}</div>
            <div class="stat">🎐 Jellyfish: ${stats.jellyfishCount}</div>
        `);
    }
}