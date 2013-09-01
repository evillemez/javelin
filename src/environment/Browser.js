/*global Javelin:true alert:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Env.Browser = function(config) {
    this.config = config;
    this.engine = null;
    this.intervalId = null;
};

Javelin.Env.Browser.prototype = new Javelin.Environment();

//NOTE: yes - I know I should be using requestAnimationFrame
Javelin.Env.Browser.prototype.run = function(stepsPerSecond) {
    var engine = this.engine;
    this.intervalId = setInterval(function() {
        try {
            engine.step();
        } catch (e) {
            console.log(e);

            if (engine.debug) {
                alert(e);
            }
        }
    }, stepsPerSecond);
};

Javelin.Env.Browser.prototype.stop = function(callback) {
    clearInterval(this.intervalId);
    setTimeout(callback, 1);
};
