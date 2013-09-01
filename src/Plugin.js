"use strict";

Javelin.EnginePlugin = function(name, engine) {
    this.$name = name;
    this.$engine = engine;
    this.$active = false;
};

Javelin.EnginePlugin.prototype.$onLoad = function() {};

Javelin.EnginePlugin.prototype.$onUnload = function() {};

//TODO: implement & test this
Javelin.EnginePlugin.prototype.$onSceneLoaded = function() {};

Javelin.EnginePlugin.prototype.$onFlush = function() {};

/* GameObject Lifecycle */
Javelin.EnginePlugin.prototype.$onPreUpdateStep = function(deltaTime) {};

Javelin.EnginePlugin.prototype.$onPostUpdateStep = function(deltaTime) {};

Javelin.EnginePlugin.prototype.$onGameObjectDestroy = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onGameObjectCreate = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onPrefabCreate = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onPrefabDestroy = function(gameObject) {};
