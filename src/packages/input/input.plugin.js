
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
 * based on the configuration passed to the this.
 * 
 * @package input
 * @type plugin
 */
javelin.plugin('input', function (config, game) {
    var self = this;
    this.config = config;
    this.handlers = {};
    this.callbacks = {};
    this.input = {};
    
    //process config and setup relevant listeners
    this.$onLoad = function() {
        if ('undefined' === typeof window) {
            return;
        }

        //setup keyboard controls
        if (self.config.keyboard) {
            var kb = self.handlers.keyboard = new KeyboardInput(self, self.config.keyboard);
            kb.registerListeners();
        }
        
        //TODO: setup mouse controls
        //TODO: setup gamepad controls        
        //TODO: setup touch controls
    };
    
    this.$onUnload = function() {
        if (self.handlers.keyboard) {
            self.handlers.keyboard.unregisterListeners();
        }
    };
    
    this.$onPreUpdate = function(deltaTime) {
        var i, j, currTime, lastTime;

        currTime = self.$engine.time;
        lastTime = self.$engine.prevTime;
        
        //all configured handlers process their own input
        for (i in self.handlers) {
            self.handlers[i].processInputEvents(currTime, lastTime, deltaTime);
        }
        
        //call any registered `input.resolve` callbacks
        for (i in self.callbacks) {
            if (self.callbacks[i]) {
                for (j in self.callbacks[i]) {
                    self.callbacks[i][j](self);
                }
            }
        }
    };
    
    this.$onPostUpdate = function(deltaTime) {
        //TODO: clear anything?
    };
    
    this.$onEntityCreate = function(gameObject) {
        var cbs = gameObject.getCallbacks('input.resolve');
        if (cbs.length) {
            self.callbacks[gameObject.id] = cbs;
        }
    };
    
    this.$onEntityDestroy = function(gameObject) {
        if (self.callbacks[gameObject.id]) {
            self.callbacks[gameObject.id] = null;
        }
    };

    //generic GET by name - will internally decide which input to call, so you need
    //to already know what type of value will be returned
    this.getInput = function (name) {
        if (!self.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return self.input[name] || false;
    };
    
    /**
     * Get value of a button control, will be between 0 and 1
     * 
     * @param {String} name The name of the control to get
     * @returns {Number} A number in the range of 0 to 1
     */    
    this.getButton = function(name) {
        if (!self.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return self.input[name].val || 0;
    };
    
    /**
     * Get whether or not a button was pressed down during the last frame.
     * 
     * @param {String} name The name of the control to get
     * @returns {Boolean}
     */    
    this.getButtonDown = function(name) {
        if (!self.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return self.input[name].down || false;
    };
    
    /**
     * Get whether or not a button was released during the last frame.
     * 
     * @param {String} name The name of the control to get
     * @returns {Boolean}
     */    
    this.getButtonUp = function(name) {
        if (!self.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return self.input[name].up || false;
    };
    
    /**
     * Get the value for an axis control, will be between -1 and 1
     * 
     * @param {String} name The name of the control to get
     * @returns {Number} A number in the range of -1 to 1
     */    
    this.getAxis = function(name) {
        if (!self.input[name]) {
            throw new Error("Requested input [" + name + "] is not defined.");
        }

        return self.input[name] || 0;
    };
    
    this.getMousePosition = function() {
        //if not present will return null values
    };
    
    this.getMouseButton = function(index) {};
    
    this.getMouseButtonUp = function(index) {};
    
    this.getMouseButtonDown = function(index) {};
    
    this.getTouch = function (index) {};
    this.getTouches = function () {};
    //this.getGesture(); abstract common gestures or something?
    
    this.getHandler = function(key) {
        return self.handlers[key] || false;
    };
    
    this.defineButton = function(name) {
        self.input[name] = {
            up: false,
            down: false,
            val: 0
        };
    };
    
    this.setButton = function(name, val) {
        self.input[name].val = val;
    };
    
    this.setButtonUp = function(name, val) {
        self.input[name].up = val;
    };
    
    this.setButtonDown = function(name, val) {
        self.input[name].down = val;
    };
    
    this.setAxis = function(name, val) {
        self.input[name] = val;
    };
});

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
