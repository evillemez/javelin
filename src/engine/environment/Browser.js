/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Environment.Browser = function() {
    this.engine = {};
};

Javelin.Environment.Browser.prototype = new Javelin.Environment();

Javelin.Environment.Browser.prototype.run = function() {
    window.requestAnimationFrame(this.run);
    
    try {
        this.engine.step();
    } catch (e) {
        console.log(e);
    }
};
