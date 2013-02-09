/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Environment.Browser = function(config) {
    this.config = config;
    this.engine = {};
};

Javelin.Environment.Browser.prototype = new Javelin.Environment();

Javelin.Environment.Browser.prototype.run = function() {
    var engine = this.engine;
    setInterval(function() {
        try {
            engine.step();
        } catch (e) {
            console.log(e);
        }
    }, 1000/30);
};
