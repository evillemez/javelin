'use strict';

Javelin.Dispatcher = function() {
    this.listeners = {};
};

Javelin.Dispatcher.prototype.on = function(name, listener) {
    this.listeners[name] = this.listeners[name] || [];
    
    this.listeners[name].push(listener);
};

Javelin.Dispatcher.prototype.dispatch = function(name, data, callback) {
    var cbs = this.listeners[name] || [];
    var l = cbs.length;

    for (var i = 0; i < l; i++) {
        if (false === cbs[i](data)) {
            if (callback) {
                callback(false);
            }

            return false;
        }
    }
    
    if (callback) {
        callback(true);
    }
    
    return true;
};
