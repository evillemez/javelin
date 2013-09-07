

/*
An base object for environments.  Environments are in charge of running and stopping an
instance of a game.  This default implementation makes no assumptions about the environment, it will
need to be overridden in some cases.
*/


'use strict';

Javelin.Environment = function(name, game) {
    this.name = name;
    this.game = game;
    this.loader = null;
};

Javelin.Environment.prototype.initialize = function() {};

Javelin.Environment.prototype.validatePlugin = function(plugin) {};

Javelin.Environment.prototype.run = function(stepsPerSecond) {
    throw new Error('Javelin.Environment.run must be implemented.');
};

Javelin.Environment.prototype.stop = function(callback) {
    throw new Error('Javelin.Environment.stop must be implemented.');
};

Javelin.Environment.prototype.getLoader = function() {
    return this.loader;
};

Javelin.Environment.prototype.setLoader = function(loader) {
    this.loader = loader;
};