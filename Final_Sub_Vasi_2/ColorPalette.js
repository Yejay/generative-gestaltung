class ColorPalette {
    constructor() {
        this.neonColors = [
            color(320, 100, 100), 
            color(180, 100, 100), 
            color(280, 100, 100), 
            color(60, 100, 100)   
        ];
        
        this.pastelColors = [
            color(35, 70, 100),   
            color(350, 60, 100),  
            color(200, 50, 100),  
            color(150, 40, 100)   
        ];
        
        this.gridColor = color(180, 100, 100);      
        this.patternColor = color(320, 100, 100); 
        this.accentColor = color(60, 100, 100);    
    }

    getNeonColor() {
        return random(this.neonColors);
    }

    getPastelColor() {
        return random(this.pastelColors);
    }

    getGridColor() {
        return this.gridColor;
    }

    getPatternColor() {
        return this.patternColor;
    }

    getAccentColor() {
        return this.accentColor;
    }

    lerpColors(c1, c2, amt) {
        let h1 = hue(c1);
        let s1 = saturation(c1);
        let b1 = brightness(c1);
        
        let h2 = hue(c2);
        let s2 = saturation(c2);
        let b2 = brightness(c2);
        
        if (abs(h1 - h2) > 180) {
            if (h1 > h2) h2 += 360;
            else h1 += 360;
        }
        
        let h = lerp(h1, h2, amt) % 360;
        let s = lerp(s1, s2, amt);
        let b = lerp(b1, b2, amt);
        
        return color(h, s, b);
    }
}
