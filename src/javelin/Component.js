/**
 * This file is part of the core group.
 *
 * @group core
 */

/**
 * The majority of game logic is defined in components.
 *
 * Multiple components are attached to entities to provide complex game logic.
 *
 * Components serve two main roles - 1, to register callbacks for the engine and its plugins, 
 * and 2, to provide custom APIs for other components.  Javelin provides several components for
 * generic things, like handling position, rendering and physics.  Game developers can define other
 * components that provide custom game logic.
 *
 * Defining a component:
 *
 *  javelin.component('mygame.warrior', function(entity, game) {
 *      
 *      this.doSomething = function() {
 *          //some custom game logic
 *      };
 * 
 *  }, ['javelin.sprite2d','javelin.rigidbody2d']);
 *
 * Accessing and using other components:
 *
 *  javelin.component('mygame.', function(entity, game) {
 *      var warrior = entity.get('mygame.warrior');
 *
 *      this.$on('engine.update', function(deltaTime) {
 *          warrior.doSomething();
 *      });
 * 
 *  },['mygame.warrior']);
 *
 * @group core 
 * 
 * @param {string} name
 */
Javelin.Component = function(name) {
    this.$name = name;
    this.$callbacks = {};
    this.$id = null;
};

/**
 * Register a callback for the engine.
 * 
 * One of the main jobs of a component is to register callbacks for the engine, or
 * the engine's plugins.
 * 
 * @param {string} name 
 * @param {function} callback  The format for the callbacks args depend on the callback.
 */
Javelin.Component.prototype.$on = function(name, callback) {
    callback.$id = this.$id;
    this.$callbacks[name] = callback;
};

Javelin.Component.prototype.$getCallback = function(name) {
    return this.$callbacks[name] || false;
};

Javelin.Component.prototype.$serialize = function() {
    var data = {};
    
    //export non-function component properties, excluding the builtins ($)
    for (var key in this) {
        if (typeof(this[key]) !== 'function' && key.charAt(0) !== '$') {
            data[key] = this[key];
        }
    }
    
    return data;
};

Javelin.Component.prototype.$unserialize = function(data) {
    for (var key in data) {
        this[key] = data[key];
    }
};
