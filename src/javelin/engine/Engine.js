/*global Javelin:true */

/*
    TODO - take into account go hierarchy
*/

'use strict';

Javelin.Engine = function(environment, config) {
    //this should persist
    this.config = config;
    this.debug = false;
    this.environment = environment;
    this.environment.engine = this;

    //everything else can be reset
    this.reset();
};

Javelin.Engine.prototype.reset = function() {
    //general state
    this.running = false;
    this.updating = false;
    
    //game object
    this.gos = [];
    this.lastGoId = 0;
    this.createdGos = [];
    this.destroyedGos = [];

    //timing
    this.stepId = 0;
    this.time = new Date().getTime();
    this.prevTime = 0.0;
    this.deltaTime = 0.0;

    //scene
    this.sceneDefinition = {};
    this.plugins = {};
        
    //configure the loader
    //TODO: think of better way to do this, possibly require it
    //via the environment
    if (this.config.loader) {
        this.loader = new Javelin.AssetLoader(this.config.loader.assetUrl || '');
    }
};

Javelin.Engine.prototype.processConfig = function(config) {

};

/* Managing Game Objects */
Javelin.Engine.prototype.__addGameObject = function(go) {
    if (-1 === go.id) {
        //register for engine
        go.setId(++this.lastGoId);
        go.engine = this;
        go.enable();
        
        //TODO: check for whether or not we're updating
        if (this.updating) {
            this.createdGos.push(go);
        } else {
            this.gos.push(go);
        }
        
        //notify plugins
        this.pluginsCreateGameObject(go);
        
        //notify object: todo: do this before or after notifying plugins?
        var cbs = go.getCallbacks('create') || [];
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }
        
        return go;
    }
    
    return false;
};

Javelin.Engine.prototype.__destroyGameObject = function(go) {
    if (-1 !== go.id) {
        //notify all contained destroy callbacks
        var cbs = go.getCallbacks('destroy', true);
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }

        //notify plugins
        this.pluginsDestroyGameObject(go);
        
        //destroy children first
        if(go.children) {
            for (var i in go.children) {
                this.__destroyGameObject(go.children[i]);
            }
        }
        
        //make sure this object is detached from any parents
        if (go.parent) {
            go.parent.removeChild(go);
        }

        //remove references
        go.setId(-1);
        go.disable();
        go.engine = null;
        
        //remove from engine
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
    }
};

Javelin.Engine.prototype.getGameObjectById = function(id) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {
        if (this.gos[i].id === id) {
            return this.gos[i];
        }
    }
    return false;
};

Javelin.Engine.prototype.instantiate = function(mixed) {
    if (Javelin.isString(mixed)) {
        return this.instantiatePrefab(mixed);
    }
    
    return this.instantiateObject(mixed);
};

//takes a string
Javelin.Engine.prototype.instantiatePrefab = function(name) {
    if (!Javelin.__prefabs[name]) {
        throw new Error("Tried instantiating unknown prefab: " + name);
    }
    
    return this.instantiateObject(Javelin.__prefabs[name]);
};

//TODO: move most creation logic into instantiate, which COULD BE A STRING REFERENCE TO A PREFAB
Javelin.Engine.prototype.instantiateObject = function(def) {
    
    //TODO: move most functionality from GO.addComponent
    //into here
    var go = new Javelin.GameObject();

    go.name = def.name || "Anonymous";

    if (def.components) {
        var components = [];
        for (var key in def.components) {
            var c = this.createGameObjectComponent(go, key);
            c.$unserialize(def.components[key]);
            components.push(c);
        }
        
        go.addComponents(components);
    }
    
    this.__addGameObject(go);
    
    if (def.children) {
        for (var i in def.children) {
            var child = this.instantiateObject(def.children[i]);
            child.setParent(go);
        }
    }    
    
    return go;
};

Javelin.Engine.prototype.createGameObjectComponent = function(go, alias) {
    if (go.hasComponent(alias)) {
        return go.getComponent(alias);
    }
    
    go.setModified();
    
    //add any required components first
    var reqs = Javelin.getComponentRequirements(alias);
    var l = reqs.length;
    for (var i = 0; i < l; i++) {
        this.createGameObjectComponent(go, reqs[i].alias);
    }
    
    var handler = Javelin.getComponentHandler(alias);
    if (!handler) {
        throw new Error("Unknown component [" + alias + "] requested");
    };

    //instantiate new component instance
    var comp = new Javelin.GameObjectComponent();
    comp.$id = go.id;
    comp.$go = go;
    comp.$alias = handler.alias;
    
    //call hierarchy in proper inheritence order
    var handlers = Javelin.getComponentChain(handler.alias);
    l = handlers.length;
    for (i = 0; i < l; i++) {
        handlers[i](go, comp);
        comp.$inheritedAliases.push(handlers[i].alias);
        go.containedAliases[handlers[i].alias] = true;
    }
    
    return comp;
};


//destroy an object (if the engine is updating, it will be destroyed after the update is done)
Javelin.Engine.prototype.destroy = function(go) {
    if (this.updating) {
        this.destroyedGos.push(go);
    } else {
        this.__destroyGameObject(go);
    }
};


/* Game Loop & State */

//This must be called before loading and running scenes
Javelin.Engine.prototype.initialize = function() {
    var func;
    var obj;
    
    if (this.config.autoregisterPlugins) {
        for (func in this.config.autoregisterPlugins) {
            Javelin.registerPlugin(this.config.autoregisterPlugins[func]);
        }
    }
    
    if (this.config.autoregisterComponents) {
        for (func in this.config.autoregisterComponents) {
            Javelin.registerComponent(this.config.autoregisterComponents[func]);
        }
    }
    
    if (this.config.autoregisterPrefabs) {
        for (obj in this.config.autoregisterPrefabs) {
            Javelin.registerPrefab(this.config.autoregisterPrefabs[obj]);
        }
    }
    
    if (this.config.autoregisterScenes) {
        for (obj in this.config.autoregisterScenes) {
            Javelin.registerScene(this.config.autoregisterScenes[obj]);
        }
    }

    //build up maps of component dependencies and whatever else
    Javelin.initialize();
    
    //TODO: load required assets
};

Javelin.Engine.prototype.run = function() {
    this.running = true;
    this.environment.run();
};

Javelin.Engine.prototype.stop = function() {
    this.environment.stop();
    this.running = false;
};

Javelin.Engine.prototype.step = function() {
    this.updating = true;
    this.stepId++;
    this.prevStepTime = this.time;
    this.time = new Date().getTime();
    this.deltaTime = this.time - this.prevStepTime;
    
    this.updateGameObjects(this.deltaTime);

    //clean now, so plugins can update with proper go array
    this.cleanupStep();

    this.updatePlugins(this.deltaTime);
    this.updating = false;
        
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    var l = this.gos.length;
    for (var i = 0; i < l; i++) {
        //TODO: only process root level objects,
        //the callbacks can be retrieved recursively
        //for nested hierarchies, which will allow
        //for efficient caching
        if (this.gos[i].enabled) {
            var cbs = this.gos[i].getCallbacks('update', false);
            for (var j = 0; j < cbs.length; j++) {
                cbs[j](deltaTime);
            }
        }
    }
};

Javelin.Engine.prototype.updatePlugins = function(deltaTime) {
    for (var i in this.plugins) {
        if (this.plugins[i].$active) {
            this.plugins[i].$onStep(deltaTime);
        }
    }
};

Javelin.Engine.prototype.cleanupStep = function() {
    var lc = this.createdGos.length;
    var ld = this.destroyedGos.length;
    var i;
    if (lc) {
        for (i = 0; i < lc; i++) {
            this.gos.push(this.createdGos[i]);
        }
    }
    
    if (ld) {
        for (i = 0; i < ld; i++) {
            this.__destroyGameObject(this.destroyedGos[i]);
        }
    }
    
    this.createdGos = [];
    this.destroyedGos = [];
};

Javelin.Engine.prototype.pluginsCreateGameObject = function(go) {
    for (var p in this.plugins) {
        this.plugins[p].$onGameObjectCreate(go);
    }
};

Javelin.Engine.prototype.pluginsDestroyGameObject = function(go) {
    for (var p in this.plugins) {
        this.plugins[p].$onGameObjectDestroy(go);
    }
};

/* Scene management */

Javelin.Engine.prototype.loadScene = function(definition, callback) {
    this.resetPlugins();
    this.reset();

    for (var name in definition.plugins) {
        this.getPlugin(name).$unserialize(definition.plugins[name]);
    }

    for (var i = 0; i < definition.objects.length; i++) {
        this.instantiateObject(definition.objects[i]);
    }

    callback();
};

/* Asset management */

Javelin.Engine.prototype.loadAsset = function(path, callback) {
    return this.loader.loadAsset(path, callback);
};

Javelin.Engine.prototype.loadAssets = function(arr, callback) {
    return this.loader.loadAssets(arr, callback);
};

/* Plugin Management */
Javelin.Engine.prototype.loadPlugin = function(alias, config) {
    if (this.plugins[alias]) {
        return;
    }
    
    var handler = Javelin.getPluginHandler(alias);
    if (!handler) {
        throw new Error("Required plugin [" + alias + "] not registered.");
    }
    
    if (Javelin.isEmpty(config) && handler.defaults) {
        config = handler.defaults;
    }
    
    var plugin = new Javelin.EnginePlugin();
    plugin.$alias = handler.alias;
    plugin.$engine = this;
    
    handler(plugin, config);
    plugin.$onLoad();
    plugin.$active = true;
    this.plugins[plugin.$alias] = plugin;
};

Javelin.Engine.prototype.unloadPlugin = function(name) {
    var p = this.getPlugin(name);
    p.$active = false;
    if(p) {
        p.$onUnload();
        this.plugins[name] = null;
    }
};

Javelin.Engine.prototype.unloadPlugins = function() {
    for (var alias in this.plugins) {
        this.unloadPlugin(alias);
    }
};

Javelin.Engine.prototype.getPlugin = function(name) {
    return this.plugins[name] || false;
};
