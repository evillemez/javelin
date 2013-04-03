"use strict";

Javelin.EnginePlugin = function() {
    this.$alias = '';
    this.$active = false;
    this.$engine = null;
};

Javelin.EnginePlugin.prototype.$onLoad = function() {};

Javelin.EnginePlugin.prototype.$onUnload = function() {};

//TODO: implement & test this
Javelin.EnginePlugin.prototype.$onSceneLoaded = function() {};

/* GameObject Lifecycle */
Javelin.EnginePlugin.prototype.$onPreUpdateStep = function(deltaTime) {};

Javelin.EnginePlugin.prototype.$onPostUpdateStep = function(deltaTime) {};

Javelin.EnginePlugin.prototype.$onGameObjectDestroy = function(gameObject) {};

Javelin.EnginePlugin.prototype.$onGameObjectCreate = function(gameObject) {};

//TODO: implement these
//Javelin.EnginePlugin.prototype.$onPrefabInstantiate = function(gameObject) {};
//Javelin.EnginePlugin.prototype.$onPrefabDestroy = function(gameObject) {};