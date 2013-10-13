
/*
A Component is a glorified map of callbacks + a public API for other components to use.
Components are processed by user-defined
functions that compose the objects internally.  Each user function receives a new blank component
instance.  Callbacks can be regisered on the component to be processed by the Engine plugins.  Properties and
methods can be added to the component instance in the function as well.  The properties and methods added
to the instance constitute the public "api" of that Javelin.Component.

Callbacks are called directly by whoever processes them - so the exact signature of a given
callback is determined by the part of the engine that is calling it.
*/

//TODO: Document writing a component
//TODO: Document interacting with a component from another component
//TODO: Document registering a callback
Javelin.Component = function(name) {
    this.$name = name;
    this.$callbacks = {};
    this.$id = null;
};

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
