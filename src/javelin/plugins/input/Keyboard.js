'use strict';

Javelin.Plugin.Input.Handler.Keyboard = function(config) {
    this.config = config;
    this.raw = {};
    this.processed = {};
    this.MAP = {
        'a': 65,
        'b': 66,
        'c': 67,
        'd': 68,
        'e': 69,
        'f': 70,
        'g': 71,
        'h': 72,
        'i': 73,
        'j': 74,
        'k': 75,
        'l': 76,
        'm': 77,
        'n': 78,
        'o': 79,
        'p': 80,
        'q': 81,
        'r': 82,
        's': 83,
        't': 84,
        'u': 85,
        'v': 86,
        'w': 87,
        'x': 88,
        'y': 89,
        'z': 90,
        'space':        32,
        'enter':        13,
        'control':      17,
        'alt':          18,
        'delete':       46, 
        'backspace':    8 ,
        'shift':        16,
        'escape':       27,
        'uparrow':      38,
        'downarrow':    40,
        'leftarrow':    37,
        'rightarrow':   39
    };
    
    if (config) {
        this.processConfig(config);
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.registerListeners = function() {
    var kb = this;

    window.addEventListener('keyup', function(e) {
        kb.handleKeyUp(e);
    });

    window.addEventListener('keydown', function(e) {
        kb.handleKeyDown(e);
    });
    
};


Javelin.Plugin.Input.Handler.Keyboard.prototype.processConfig = function(config) {
    this.config = config;
    this.raw = {};
    this.processed = {};
    
    var control;
    
    //buttons
    if (config.buttons) {
        for (control in config.buttons) {
            if (this.MAP[config.buttons[control]]) {
                this.raw[this.MAP[config.buttons[control]]] = {
                    up: false,
                    down: false,
                    time: Date.now(),
                    axis: false,
                    control: control
                };
                
                this.processed[control] = {
                    value: 0,
                    up: false,
                    down: false
                };
            }
        }
    }
    
    //axes
    if (config.axes) {
        for (control in config.axes) {
            //TODO:
        }
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getKeyId = function(event) {
    var codes = [];
    if (event.keyCode) {
        console.log(event.keyCode);
        codes.push(event.keyCode);
    }

    if (event.altKey) {
        console.log(18);
        codes.push(18);
    }
    
    if (event.ctrlKey) {
        console.log(17);
        codes.push(17);
    }
    
    if (event.shift) {
        console.log(16);
        codes.push(16);
    }
    
    return codes;
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.handleKeyDown = function(event) {
    var codes = this.getKeyId(event);
    for (var i in codes) {
        if (this.raw[codes[i]]) {
            event.preventDefault();

            var key = this.raw[codes[i]];
            key.down = true;
            key.up = false;
            key.time = Date.now();
        }
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.handleKeyUp = function(event) {
    var codes = this.getKeyId(event);
    for (var i in codes) {
        if (this.raw[codes[i]]) {
            event.preventDefault();

            var key = this.raw[codes[i]];
            key.down = false;
            key.up = true;
            key.time = Date.now();
        }
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.processInputEvents = function(deltaTime) {
    // body...
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getButton = function(name) {};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getButtonUp = function(name) {};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getDown = function(name) {};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getAxis = function(name) {};

Javelin.Plugin.Input.Handler.Keyboard.prototype.getInput = function(name) {};
