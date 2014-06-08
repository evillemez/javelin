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
 *  javelin.component('mygame.character', ['pixi.sprite','p2.rigidbody'], function(entity, game) {
 *
 *      this.doSomething = function() {
 *          //some custom game logic
 *      };
 *
 *  });
 *
 * Accessing and using other components:
 *
 *  javelin.component('mygame.warrior', ['mygame.character'], function(entity, game) {
 *      var character = entity.get('mygame.character');
 *
 *      entity.on('engine.update', function(deltaTime) {
 *          character.doSomething();
 *      });
 *
 *  });
 *
 * @group core
 *
 * @param {string} name
 */
Javelin.Component = function(name) {
    this.$name = name;
    this.$id = null;
    this.$entity = null;
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
