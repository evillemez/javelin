/*global Javelin:true */

'use strict';

Javelin.Engine = function(config) {
    //this should persist
    this.config = config;

    //everything else can be reset
    this.reset();
    
};

Javelin.Engine.prototype.reset = function() {
    //general state
    this.stopped = false;
    
    //game object
    this.gos = [];
    this.goIdMap = {};
    this.lastGoId = 0;

    //timing
    this.step = 0;
    this.time = 0.0;
    this.prevTime = 0.0;
    this.deltaTime = 0.0;

    //scene
    this.sceneDefinition = {};
    
    //plugins
    this.plugins = [];
    
    //run any setup based on constructor config
    this.processConfig(this.config);
};


/* Managing Game Objects */
//TODO: take into account children
Javelin.Engine.prototype.addGameObject = function(go) {
    if (!go.id) {
        go.id = ++this.lastGoId;
        go.engine = this;
        go.active = true;
        
        this.gos.push(go);
        this.pluginsAddGameObject(go);
    }
};

Javelin.Engine.prototype.destroyGameObject = function(go) {
    if (go.id) {
        this.pluginsDestroyGameObject(go);
        this.goIdMap[go.id] = null;
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
    }
};

Javelin.Engine.prototype.getGameObjectById = function(id) {
    return this.gos[this.goIdMap[id]] || false;
};

/* Game Loop */

Javelin.Engine.prototype.step = function() {
    this.step++;
    this.prevStepTime = this.time;
    this.time = new Date().getTime();
    this.deltaTime = this.time - this.prevStepTime;
    
    this.updateGameObjects(this.deltaTime);
    this.updatePlugins();
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    for (var i = 0; i < this.gos.length; i++) {
        var cbs = this.gos[i].getCallbacks('update');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j](deltaTime);
        }
    }
};


/* Scene management */

Javelin.Engine.prototype.loadScene = function(definition, callback) {
    this.pluginsReset();
    this.reset();

    this.environment.$onBeforeSceneLoad(definition);

    for (var plugin in definition.plugins) {
        this.plugins[plugin] = {};
    }

    this.environment.$onAfterSceneLoad(definition);

    callback();
};

Javelin.Engine.prototype.run = function() {
    this.environment.run();
};


/* Plugin Management */