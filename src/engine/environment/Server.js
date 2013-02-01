/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Environment.Server = function() {
    this.engine = {};
};

Javelin.Environment.Server.prototype = new Javelin.Environment();

Javelin.Environment.Server.prototype.run = function() {
    //TODO:
};
