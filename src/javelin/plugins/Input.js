'use strict';

Javelin.Plugin.Input = function (plugin, config) {
	plugin.config = config;
	plugin.$when = Javelin.EnginePlugin.BEFORE;
    plugin.handlers = {};
    plugin.callbacks = {};
    plugin.input = {};
	
    //process config and setup relevant listeners
	plugin.$onLoad = function() {
        
		//setup keyboard controls
        if (plugin.config.keyboard && window) {
            var kb = plugin.handlers['keyboard'] = new Javelin.Plugin.Input.Handler.Keyboard(plugin.config.keyboard);
            kb.registerListeners();
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
	
	plugin.$onStep = function(deltaTime) {
        var i, j;
        
		//all configured handlers process their own input
        for (i in plugin.handlers) {
            plugin.handlers[i].processInputEvents(deltaTime);
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
        return this.input[name] || false;
    };
    
	plugin.getButton = function(name) {
        return this.input[name] || 0;
	};
	
	plugin.getButtonDown = function(name) {
        return this.input[name] || false;
	};
	
	plugin.getButtonUp = function(name) {
        return this.input[name] || false;
	};
	
	plugin.getAxis = function(name) {
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
    
    plugin.setButton = function(name, val) {
        this.input[name] = val;
    };
    
    plugin.setButtonUp = function(name, val) {
        this.input[name] = val;
    };
    
    plugin.setButtonDown = function(name, val) {
        this.input[name] = val;
    };
    
    plugin.setAxis = function(name, val) {
        this.input[name] = val;
    };
};
Javelin.Plugin.Input.alias = 'input';

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
