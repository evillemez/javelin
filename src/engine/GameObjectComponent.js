/*global Javelin:true */

/*
A GameObjectComponent is a glorified map of callbacks + a public API for other components to use.
Components are processed by user-defined
scripts that compose the objects internally.  Each user script receives a new blank component
instance.  Callbacks can be regisered on the component to be processed by the Engine plugins.

Callbacks are called directly by whoever processes them - so the exact structure of a given
callback is determined by the part of the engine that is calling it.
*/


'use strict';

Javelin.GameObjectComponent = function() {
    this.$callbacks = {};
    this.$go = {};
    this.$id = 0;
    this.$alias = '';
    this.$inheritedAliases = [];
};

Javelin.GameObjectComponent.prototype.$on = function(name, callback) {
    callback.$id = this.$id;
    this.$callbacks[name] = callback;
};

Javelin.GameObjectComponent.prototype.$getCallback = function(name) {
    return this.$callbacks[name] || false;
};

Javelin.GameObjectComponent.prototype.$serialize = function() {
    var data = {};
    
    //export non-function component properties, excluding the builtins ($)
    for (var key in this) {
        if (typeof(this[key]) !== 'function' && key.charAt(0) !== "$") {
            data[key] = this[key];
        }
    }
    
    return data;
};

Javelin.GameObjectComponent.prototype.$unserialize = function(data) {
    for (var key in data) {
        this[key] = data[key];
    }
};
