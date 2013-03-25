'use strict';

Javelin.Plugin.Input.Handler.Keyboard = function(plugin, config) {
    this.config = config;
    this.raw = {};
    this.processed = {};
    this.plugin = plugin;
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
    
    var kb = this;
    
    this.keyUpListener = function(e) {
        kb.handleKeyUp(e);
    };
    
    this.keyDownListener = function(e) {
        kb.handleKeyDown(e);
    };
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.registerListeners = function() {
    window.addEventListener('keyup', this.keyUpListener);
    window.addEventListener('keydown', this.keyDownListener);    
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.unregisterListeners = function() {
    window.removeEventListener('keyup', this.keyUpListener);
    window.removeEventListener('keydown', this.keyDownListener);
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.processInputEvents = function(currTime, lastTime, deltaTime) {
    //TODO: start here, this is wrong
    for (var control in this.raw) {
        var raw = this.raw[control];
        
        //process buttons
        if (!raw.axis) {
            var pressed;
            
            //if we didn't process this key during this frame, then whether or not 
            //it's "pressed" depends on the last state, and up/down are both false
            if (raw.time < lastTime) {
                if (raw.up) {
                    pressed = false;
                    raw.up = false;
                    raw.down = false;
                }
                if (raw.down) {
                    raw.up = false;
                    raw.down = false;
                    pressed = true;
                }

                this.plugin.setButtonUp(control, raw.up);
                this.plugin.setButtonDown(control, raw.down);
                this.plugin.setButton(control, (pressed) ? 1 : 0);

            } else {
                if (raw.up) {
                    this.plugin.setButtonUp(control, true);
                    this.plugin.setButtonDown(control, false);
                    this.plugin.setButton(control, 1);
                }
                
                if (raw.down) {
                    this.plugin.setButtonUp(control, false);
                    this.plugin.setButtonDown(control, true);
                    this.plugin.setButton(control, 0);
                }
            }
            
        } else {
            //TODO: process axis
        }
    }
};


Javelin.Plugin.Input.Handler.Keyboard.prototype.processConfig = function(config) {
    this.config = config;
    this.raw = {};
    
    var control;
    
    //buttons
    if (config.buttons) {
        for (control in config.buttons) {
            if (this.MAP[config.buttons[control]]) {

                //tells plugin to create spot for final values
                this.plugin.defineButton(control);
                
                //create internal raw storage spot for later processing
                this.raw[this.MAP[config.buttons[control]]] = {
                    up: false,
                    down: false,
                    time: Date.now(),
                    axis: false,
                    control: control
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
        codes.push(event.keyCode);
    }

    if (event.altKey) {
        codes.push(18);
    }
    
    if (event.ctrlKey) {
        codes.push(17);
    }
    
    if (event.shift) {
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
