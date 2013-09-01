/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/


'use strict';

Javelin.Environment = function(name, game, loader) {
    this.name = name;
    this.game = game;
    this.loader = loader;
};

Javelin.Environment.prototype.initialize = function() {};

Javelin.Environment.prototype.validatePlugin = function(plugin) {};

Javelin.Environment.prototype.run = function(stepsPerSecond) {};

Javelin.Environment.prototype.stop = function(callback) {};
