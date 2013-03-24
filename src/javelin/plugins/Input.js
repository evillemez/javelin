'use strict';

Javelin.Plugin.Input = function (plugin, config) {
	plugin.config = config;
	plugin.$when = Javelin.EnginePlugin.BEFORE;
    plugin.handlers = {};
	
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
	
	plugin.$onStep = function(deltaTime) {
		//all configured handlers process their own input
        for (var i in this.handlers) {
            plugin.handlers[i].processInputEvents(deltaTime);
        }
	};

    //generic GET by name - will internally decide which input to call, so you need
    //to already know what type of value will be returned
    plugin.getInput = function (name) {
        if (plugin.handlers['keyboard']) {
            return plugin.handlers['keyboard'].getInput(name);
        }
    };
    
	plugin.getButton = function(name) {
        if (plugin.handlers['keyboard']) {
            return plugin.handlers['keyboard'].getButton(name);
        }
	};
	
	plugin.getButtonDown = function(name) {
        if (plugin.handlers['keyboard']) {
            return plugin.handlers['keyboard'].getButtonDown(name);
        }
	};
	
	plugin.getButtonUp = function(name) {
        if (plugin.handlers['keyboard']) {
            return plugin.handlers['keyboard'].getButtonUp(name);
        }
	};
	
	plugin.getAxis = function(name) {
        if (plugin.handlers['keyboard']) {
            return plugin.handlers['keyboard'].getAxis(name);
        }
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
