

/*
An base object for environments.  Environments are in charge of running and stopping an
instance of a game.  This default implementation makes no assumptions about the environment, it will
need to be overridden in some cases.
*/


'use strict';

function Environment(name, game) {
    this.name = name;
    this.game = game;
    this.loader = null;
}

Environment.prototype.initialize = function() {};

Environment.prototype.validatePlugin = function(plugin) {};

Environment.prototype.run = function(stepsPerSecond) {
	throw new Error('Environment.run must be implemented.');
};

Environment.prototype.stop = function(callback) {
	throw new Error('Environment.stop must be implemented.');
};

Environment.prototype.getLoader = function() {
	return this.loader;
};

Environment.prototype.setLoader = function(loader) {
	this.loader = loader;
};
