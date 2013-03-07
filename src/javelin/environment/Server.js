/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Env.Server = function() {
    this.engine = {};
};

Javelin.Env.Server.prototype = new Javelin.Environment();

Javelin.Env.Server.prototype.run = function() {
    //TODO:
};
