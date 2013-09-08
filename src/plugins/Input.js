'use strict';

/**
 * This callback can be executed by registering a listener for the
 * `input.resolve` event in any component.  This will allow user code
 * to override or modify user input values.
 * 
 * @param {Object} plugin The instance of the `input` plugin
 * @callback
 */

/**
 * This plugin processes and stores user input.  It uses separate handlers to listen for 
 * and process the raw input values.  These handlers are loaded and unloaded automatically
 * based on the configuration passed to the plugin.
 * 
 * @class Javelin.Plugin.Input
 * @author Evan Villemez
 */
javelin.plugin('input', function (plugin, config) {
	plugin.config = config;
    plugin.handlers = {};
    plugin.callbacks = {};
    plugin.input = {};
	
    //process config and setup relevant listeners
	plugin.$onLoad = function() {
        
		//setup keyboard controls
        if (plugin.config.keyboard) {
            var kb = plugin.handlers['keyboard'] = new Javelin.KeyboardInput(plugin, plugin.config.keyboard);
            if ('undefined' !== typeof window) {
                kb.registerListeners();
            }
        }
        
        //TODO: setup mouse controls
        //TODO: setup gamepad controls        
        //TODO: setup touch controls
	};
    
    plugin.$onUnload = function() {
        if (plugin.handlers['keyboard']) {
            plugin.handlers['keyboard'].unregisterListeners();
        }
    };
	
	plugin.$onPreUpdateStep = function(deltaTime) {
        var i, j, currTime, lastTime;
        
        currTime = plugin.$engine.time;
        lastTime = plugin.$engine.prevTime;
        
		//all configured handlers process their own input
        for (i in plugin.handlers) {
            plugin.handlers[i].processInputEvents(currTime, lastTime, deltaTime);
        }
        
        //call any registered `input.resolve` callbacks
        for (i in plugin.callbacks) {
            if (plugin.callbacks[i]) {
                for (j in plugin.callbacks[i]) {
                    plugin.callbacks[i][j](plugin);
                }
            }
        }
	};
    
    plugin.$onPostUpdateStep = function(deltaTime) {
        //TODO: clear anything?
    };
    
    plugin.$onGameObjectCreate = function(gameObject) {
        var cbs = gameObject.getCallbacks('input.resolve');
        if (cbs.length) {
            plugin.callbacks[gameObject.id] = cbs;
        }
    };
    
    plugin.$onGameObjectDestroy = function(gameObject) {
        if (plugin.callbacks[gameObject.id]) {
            plugin.callbacks[gameObject.id] = null;
        }
    };

    //generic GET by name - will internally decide which input to call, so you need
    //to already know what type of value will be returned
    plugin.getInput = function (name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name] || false;
    };
    
    /**
     * Get value of a button control, will be between 0 and 1
     * 
     * @param {String} name The name of the control to get
     * @returns {Number} A number in the range of 0 to 1
     */    
	plugin.getButton = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name].val || 0;
	};
	
    /**
     * Get whether or not a button was pressed down during the last frame.
     * 
     * @param {String} name The name of the control to get
     * @returns {Boolean}
     */    
	plugin.getButtonDown = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name].down || false;
	};
	
    /**
     * Get whether or not a button was released during the last frame.
     * 
     * @param {String} name The name of the control to get
     * @returns {Boolean}
     */    
	plugin.getButtonUp = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name].up || false;
	};
	
    /**
     * Get the value for an axis control, will be between -1 and 1
     * 
     * @param {String} name The name of the control to get
     * @returns {Number} A number in the range of -1 to 1
     */    
	plugin.getAxis = function(name) {
        if (!this.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return this.input[name] || 0;
	};
	
    plugin.getMousePosition = function() {
        //if not present will return null values
    };
    
    plugin.getMouseButton = function(index) {};
    
    plugin.getMouseButtonUp = function(index) {};
    
    plugin.getMouseButtonDown = function(index) {};
    
    plugin.getTouch = function (index) {};
    plugin.getTouches = function () {};
    //plugin.getGesture(); abstract common gestures or something?
    
    plugin.getHandler = function(key) {
        return this.handlers[key] || false;
    };
    
    plugin.defineButton = function(name) {
        this.input[name] = {
            up: false,
            down: false,
            val: 0
        };
    };
    
    plugin.setButton = function(name, val) {
        this.input[name].val = val;
    };
    
    plugin.setButtonUp = function(name, val) {
        this.input[name].up = val;
    };
    
    plugin.setButtonDown = function(name, val) {
        this.input[name].down = val;
    };
    
    plugin.setAxis = function(name, val) {
        this.input[name] = val;
    };
});



//declare subnamespce for specific input implementations
Javelin.Plugin.Input.Handler = Javelin.Plugin.Input.Handler || {};

/* 

//Example config:

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
