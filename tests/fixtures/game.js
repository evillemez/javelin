"use strict";
var javelin = require('../../build/javelin.js');

//no plugins, only testing core
var game = javelin.game('game', {
	name: 'My Test Game',
	plugins: {}
});

javelin.environment('javelin.browser', function() {

	this.foo = 'bar';

	this.stuff = function() {};

	this.run = function(deltaTime) {

	};
});

javelin.plugin('canvas2d', function() {

	this.$onPreUpdate = function() {};
	this.$onFlush = function() {};
});

//main player component
javelin.component('game.player', function(entity, game) {
	var self = this;

	this.health = 100;
	this.speed = 100;

	//references to other components
	var transform, audio, enemyRef;

	this.$on('engine.create', function () {
		transform = entity.get('javelin.transform2d');
		audio = entity.get('javelin.audioEmitter');
		enemyRef = game.instantiate('game.enemy');
	});

	this.$on('engine.destroy', function() {
		//destroy logic
		game.loadScene('game.ending');
		entity.emit('game.playerDeath');
	});

	this.$on('engine.update', function() {
		transform.translate(5 * self.speed, 5 * self.speed);
		if (enemyRef.exists()) {
			enemyRef.get().destroy();
		}
	});

}).require(['javelin.sprite2d', 'javelin.audioEmitter','javelin.audioListener']);

//declare prefab
javelin.prefab('game.player', {
	tags: ['player'],
	components: {
		'javelin.transform2d': {
			position: {
				x: 100,
				y: 100
			}
		},
		'game.player': {
			health: 86,
			speed: 35
		}
	},
	children: [
		{
			fromPrefab: 'game.mainWeapon'
		},
		{
			fromPrefab: 'game.secondaryWeapon'
		}
	]
});

//declare scenes
javelin.scene('game.main', {});
javelin.scene('game.ending', {});

//setup game
game.on('game.playerDeath', function() {
	game.stop();
});

game.loadScene('game.main', function(game) {
	//custom logic
	game.run();
});

