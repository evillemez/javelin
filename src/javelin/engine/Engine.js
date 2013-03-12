/*global Javelin:true */

'use strict';

Javelin.Engine = function(environment, config) {
    //this should persist
    this.config = config;
    this.debug = config.debug || false;
    this.targetFps = config.stepsPerSecond || 1000/30;
    this.environment = environment;
    this.environment.engine = this;

    //everything else can be reset
    this.reset();
};

Javelin.Engine.prototype.reset = function() {
    //general state
    this.running = false;
    this.updating = false;
    this.isRunningSlowly = false;
    this.currentFps = 0.0;
    this.lastUpdateTimeTaken = 0.0;
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
    this.currentScene = false;
        
    //configure the loader
    //TODO: think of better way to do this, possibly require it
    //via the environment
    if (this.config.loader) {
        this.loader = new Javelin.AssetLoader(this.config.loader.assetUrl || '');
    }
};

/* Managing Game Objects */

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

Javelin.Engine.prototype.instantiateObject = function(def) {
    var go = new Javelin.GameObject();

    go.name = def.name || "Anonymous";

    if (def.components) {
        for (var key in def.components) {
            var c = this.addComponentToGameObject(go, key);
            c.$unserialize(def.components[key]);
        }
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

Javelin.Engine.prototype.addComponentToGameObject = function(go, alias) {
    if (go.hasComponent(alias)) {
        return go.getComponent(alias);
    }
        
    //add any required components first
    var reqs = Javelin.getComponentRequirements(alias);
    var l = reqs.length;
    for (var i = 0; i < l; i++) {
        this.addComponentToGameObject(go, reqs[i].alias);
    }
    
    var handler = Javelin.getComponentHandler(alias);
    if (!handler) {
        throw new Error("Unknown component [" + alias + "] requested");
    }

    //instantiate new component instance
    var comp = new Javelin.GameObjectComponent();
    comp.$id = go.id;
    comp.$go = go;
    comp.$alias = handler.alias;
    
    //call hierarchy in proper inheritence order
    var handlers = Javelin.getComponentChain(alias);
    l = handlers.length;
    for (i = 0; i < l; i++) {

        //NOTE: if the format of components changes, this
        //will need to be modified... easy change for the engine
        //but sucks for users, need to figure out the best way
        //of writing components ASAP
        handlers[i](go, comp);
        
        comp.$inheritedAliases.push(handlers[i].alias);
    }
    
    
    go.setComponent(alias, comp);
    
    return comp;
};

Javelin.Engine.prototype.__addGameObject = function(go) {
    if (-1 === go.id) {
        //register for engine
        go.setId(++this.lastGoId);
        go.engine = this;
        go.enable();
        
        if (this.updating) {
            this.createdGos.push(go);
        } else {
            this.gos.push(go);
        }
        
        //TODO: move notification of plugins and create callbacks to only happen
        //if !engine.updating
        
        //notify object
        var cbs = go.getCallbacks('create') || [];
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }

        //notify plugins
        this.pluginsCreateGameObject(go);
        
        return go;
    }
    
    return false;
};

//destroy an object (if the engine is updating, it will be destroyed after the update is done)
Javelin.Engine.prototype.destroy = function(go) {
    if (this.updating) {
        this.destroyedGos.push(go);
    } else {
        this.__destroyGameObject(go);
    }
};

Javelin.Engine.prototype.__destroyGameObject = function(go) {
    if (-1 !== go.id) {
        var i;
        //destroy children first
        if(go.children) {
            //copy into separate array so we can abandon now
            var children = [];
            for (i in go.children) {
                children.push(go.children[i]);
            }
            go.abandonChildren();

            //destroy children
            for (i in children) {
                this.__destroyGameObject(children[i]);
            }
        }
        
        //notify destroy callbacks
        var cbs = go.getCallbacks('destroy');
        for (i = 0; i < cbs.length; i++) {
            cbs[i]();
        }

        //notify plugins
        this.pluginsDestroyGameObject(go);
        
        //make sure this object is detached from any parents, 
        //because we abandoned and deleted children already,
        //this should only be the case if this go is a child of
        //another object that is NOT being deleted
        if (go.parent) {
            go.parent.removeChild(go);
        }

        //remove references
        go.setId(-1);
        go.engine = null;
        
        //remove from engine
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
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
    this.environment.run(this.targetFps);
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
    
    //TODO: pre-update plugins
    
    this.updateGameObjects(this.deltaTime);
    
    //TODO: post-update plugins

    this.updatePlugins(this.deltaTime);
    this.updating = false;

    //clean now, so plugins can update with proper go array
    this.cleanupStep();

    this.lastUpdateTimeTaken = new Date().getTime() - this.time;
    
    if(this.lastUpdateTimeTaken > this.targetFps) {
        this.isRunningSlowly = true;
    } else {
        this.isRunningSlowly = false;
    }
    
    if (this.debug) {
        console.log("Updated  " + this.gos.length + ' gos in ' + this.lastUpdateTimeTaken + ' targeting ' + this.targetFps + ' fps.');
    }
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

Javelin.Engine.prototype.getCurrentScene = function() {
    return this.currentScene;
};

Javelin.Engine.prototype.loadScene = function(name, callback) {
    this.reset();
    var scene = Javelin.getScene(name);
    
    if(!scene) {
        throw new Error("Tried loading unregistered scene: " + name);
    }

    this.sceneDefinition = scene;
    this.currentScene = name;
    
    //load plugins defined in scene - otherwise, check main config
    var alias;
    if (scene.plugins) {
        for (alias in scene.plugins) {
            var config = !Javelin.isEmpty(scene.plugins[alias]) ? scene.plugins[alias] : {};
            this.loadPlugin(alias, config);
        }
    } else {
        for (alias in this.config.plugins) {
            this.loadPlugin(alias, {});
        }
    }

    for (var i = 0; i < scene.objects.length; i++) {
        this.instantiate(scene.objects[i]);
    }
    
    if (callback) {
        callback();
    }
};

Javelin.Engine.prototype.unloadScene = function() {
    this.unloadPlugins();
    this.reset();
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
    
    if (Javelin.isEmpty(config)) {
        config = this.config.plugins[alias] || handler.defaults;
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
