class UI {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.panel = this.setupUI();
        colorMode(RGB);
    }

    setupUI() {
        let panel = createDiv('');
        panel.class('control-panel'); // For top-left stats/buttons
        this.statsDiv = createDiv('');
        this.statsDiv.class('stats');
        this.statsDiv.parent(panel);
    
        // Slider container for bottom-left sliders
        let sliderContainer = createDiv('');
        sliderContainer.class('slider-container'); // Bottom-left sliders
        this.createSlider(sliderContainer, 'Separation Weight', 0, 3, 1.5, 0.1,
            value => this.callbacks.onSeparationWeightChange(value));
        this.createSlider(sliderContainer, 'Alignment Weight', 0, 3, 1.0, 0.1,
            value => this.callbacks.onAlignmentWeightChange(value));
        this.createSlider(sliderContainer, 'Cohesion Weight', 0, 3, 1.0, 0.1,
            value => this.callbacks.onCohesionWeightChange(value));
    
        // Buttons container remains in top-left
        let buttonDiv = createDiv('');
        buttonDiv.class('button-container');
        buttonDiv.parent(panel);
    
        // Create buttons
        this.createButton(buttonDiv, '🐟 Add Fish', () => this.callbacks.onAddFish());
        this.createButton(buttonDiv, '🦈 Add Shark', () => this.callbacks.onAddShark());
        this.createButton(buttonDiv, '🎐 Add Jellyfish', () => this.callbacks.onAddJellyfish());
        this.createButton(buttonDiv, '🔄 Reset', () => this.callbacks.onReset());
    
        return panel;
    }
    
    

    createSlider(parent, label, min, max, value, step, callback) {
        let wrapper = createDiv('');
        wrapper.class('slider-wrapper');
        wrapper.parent(parent);
    
        // Add label
        createSpan(label).parent(wrapper);
    
        // Create slider
        let slider = createSlider(min, max, value, step);
        slider.input(() => {
            console.log(`${label} slider changed to:`, slider.value()); // Add this for debugging
            callback(slider.value());
        });
        slider.parent(wrapper);
    
        // Add value display
        let valueDisplay = createSpan(value.toFixed(1));
        valueDisplay.parent(wrapper);
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