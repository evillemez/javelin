'use strict';

Javelin.Plugin.Input.Handler.Keyboard = function(config) {
    this.config = config;
    this.raw = {};
    this.processed = {};
    this.active = false;
    
    var kbListener = function(event) {
        if (false /* is one of the game configs keys */) {
            event.preventDefault();
        
            //store stuff in raw input
        }
    };

    //setup listeners
    if (window) {
        window.addEventListener('keyup', kbListener);
        window.addEventListener('keydown', kbListener);
    }
};

Javelin.Plugin.Input.Handler.Keyboard.prototype.processInputEvents = function() {
    // body...
};

Javelin.Plugin.Input.Handler.Keyboard.MAP = {
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
    'space': 32,
    'enter': 13,
    'control': 17,
    'alt': 18,
    'delete': 46, 
    'backspace': 8,
    'shift': 16,
    'escape': 27,
    'uparrow': 38,
    'downarrow': 40,
    'leftarrow': 37,
    'rightarrow': 39
    /* TODO: add numbers/symbols */
};
