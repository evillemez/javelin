'use strict';

//NOTE: should probably split a lot of this out into separate files per control method
Javelin.Plugin.Input = function (engine, plugin, config) {
	plugin.config = config;
	plugin.$when = Javelin.EnginePlugin.BEFORE;
	
    //private input values
    var kbRaw, mouseRaw, gamepadRaw, touchRaw, kbProcessed, mouseProcessed, gamepadProcessed, touchProcessed;
    
    //build internal state based on config, and do
    //whatever setup needs to be done
	var processConfig = function() {

        //clear all input values
        kbRaw = {};
        kbProcessed = {};
        mouseRaw = {};
        mouseProcessed = {};
        gamepadRaw = {};
        gamepadProcessed = {};
        touchRaw = {};
        touchProcessed = [];
        
        //initialize relevant input config
        
	};

    //process config and setup relevant listeners
	plugin.$onInitialize = function() {
		processConfig();
        
		//setup keyboard controls
        if (this.config.keyboard) {
            
            //register listeners
            if (window) {
                window.addEventListener('keyup', keyboardListener);
                window.addEventListener('keydown', keyboardListener);
            }
        }
        
        //setup mouse controls
        if (this.config.mouse) {
            if (window && document && this.config.mouse.captureTarget) {
                var elem = document.getElementById(this.config.mouse.captureTarget);
                elem.addEventListener('mousemove', mouseListener);
                elem.addEventListener('mousedown', mouseListener);
                elem.addEventListener('mouseup', mouseListener);
            }
        }
        
        //TODO: setup gamepad controls
        if (false) {
            //do stuff....
        }
        
        //TODO: setup touch controls... ?
	};
	
	plugin.$onStep = function(deltaTime) {
		//loop through configured axes, check 'raw' input and calculate 'processed'
	};
	
    //private event listener for handling keyboard input
    var keyboardListener = function(e) {
        
    };
    
    //private event listener for handling mouse events
    var mouseListener = function (e) {};
    
	/* public API */
	
	plugin.setControlConfig = function(config) {
		plugin.config = config;
		processConfig();
	};
	
    //generic GET by name - will internally decide which input to call, so you need
    //to already know what type of value will be returned
    plugin.getInput = function (name) {};
    
	plugin.getButton = function(name) {};
	
	plugin.getButtonDown = function(name) {};
	
	plugin.getButtonUp = function(name) {};
	
	plugin.getAxis = function(name) {};
	
    plugin.getMousePosition = function() {
        //if not present will return null values
    };
    
    plugin.getMouseButton = function(index) {};
    
    plugin.getMouseButtonUp = function(index) {};
    
    plugin.getMouseButtonDown = function(index) {};
    
    plugin.getTouch = function (index) {};
    plugin.getTouches = function () {};
    
    //plugin.getGesture(); abstract common gestures or something?
};
Javelin.Plugin.Input.alias = 'input';

//mostly taken from: http://www.webonweboff.com/tips/js/event_key_codes.aspx
Javelin.Plugin.Input.KEYBOARD_KEYCODES = {
    'a': 65,
    // ...
    'z': 90,
    'space': 0,
    'enter': 0,
    'control': 0,
    'alt': 0,
    'delete': 0, 
    'backspace': 0,
    'shift': 0,
    'escape': 0
};

/* Example config */
/*
var config = {
    //joystick, same as gamepad?
	joystick: {},
    //how best to map 'input' to hammer.js gestures?
    touch: {
        input: {
            'move left': 'swipe left'
        }
    },
	mouse: {
        captureTarget: 'game',
        requireCapture: true,   //will request mouse-lock on browsers that support it
        buttons: {
            'fire': 0,      //button indices
            'alt-fire': 1
        }
    },
	keyboard: {
		buttons: {
			'fire': 'space'
		},
		axes: {
			'move-horiz': {
				positive: 'd',
				negative: 'a',
				snap: true,
				ramp: 2
			},
			'move-vert': {
				positive: 'w',
				negative: 's',
				snap: true,
				ramp: 2
			}
		}
	},
	gamepad: {
		buttons: {
			'fire': 'A'
		},
		axes: {
			'move-horiz': {},
			'move-vert': {}
		}
	},
};
*/