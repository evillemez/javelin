(function() {

;'use strict';

var Javelin = Javelin || {};

//setup sub namespaces
Javelin.Plugin = {};
Javelin.Component = {};
Javelin.Environment = {};
Javelin.Editor = {};

//component registry
Javelin.__componentHandlers = {};
Javelin.__componentChain = {};
Javelin.__componentRequirements = {};
Javelin.register = function(handler) {
    Javelin.__componentHandlers[handler.alias] = handler;
};
Javelin.getComponentHandler = function(name) {
    return Javelin.__componentHandlers[name] || false;
};
Javelin.getComponentChain = function(name) {
    return Javelin.__componentChain[name] || [];
};
Javelin.getComponentRequirements = function(name) {
    return Javelin.__componentRequirements || [];
};
Javelin.buildComponentHierarchy = function(name) {
    //TODO
};
Javelin.buildComponentRequirements = function(name) {
    //TODO
};

//figure out all component inheritence and requirements
Javelin.initialize = function() {
    for (var name in Javelin.__componentHandlers) {

        //build inheritance chain
        Javelin.buildComponentChain(Javelin.__componentHandlers[name]);
        
        //build requirements
        Javelin.buildComponentRequirements(Javelin.__componentHandlers[name]);
    }
};
;'use strict';

//TODO: an asset is anything in separate file, really...
//could be an image, sound file, json structure...

//assets are loaded by environments, which can translate the relative paths
//to something useful

//for example a "required" asset may be downloaded from the server before the game can start
//and stored locally for quick retrieval - where-as "unrequired" assets may just be streamed
//from the server as needed

Javelin.Asset = function(path) {
    this.path = path;
    
    this.loaded = false;
    //this.type = base on file extension
};
;/*global Javelin:true */

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

    //timing
    this.step = 0;
    this.time = 0.0;
    this.prevTime = 0.0;
    this.deltaTime = 0.0;

    //scene
    this.sceneDefinition = {};
    this.plugins = [];
        
    //run any setup based on constructor config
    this.processConfig(this.config);
};

Javelin.Engine.prototype.processConfig = function(config) {
    var plugins = config.plugins || [];
    for (var i in plugins) {
        this.addPlugin(plugins[i]);
    }
    
    var opts = config.options || {};
    for (var j in opts) {
        this.getPlugin(j).$unserialize(opts[j]);
    }
};


/* Managing Game Objects */
Javelin.Engine.prototype.addGameObject = function(go) {
    if (!go.id) {
        //register for engine
        go.id = ++this.lastGoId;
        go.engine = this;
        go.active = true;
        this.gos.push(go);
        
        //notify plugins
        this.pluginsAddGameObject(go);
        
        //notify object
        var cbs = go.getCallbacks('create');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }
    }
};

Javelin.Engine.prototype.removeGameObject = function(go) {
    if (go.id) {
        //notify object
        var cbs = go.getCallbacks('destroy');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j]();
        }

        //notify plugins
        this.pluginsDestroyGameObject(go);
        
        //clean up self
        go.id = 0;
        var index = this.gos.indexOf(go);
        this.gos.splice(index, 1);
    }
};

Javelin.Engine.prototype.getGameObjectById = function(id) {
    return this.gos[this.goIdMap[id]] || false;
};

Javelin.Engine.prototype.instantiate = function(def) {
    var go = new Javelin.GameObject();

    go.name = def.name || "Anonymous";

    if (def.components) {
        for (var key in def.components) {
            var c = go.addComponent(Javelin.getComponentHandler(key));
            c.$unserialize(def.components[key]);
        }
    }
    
    if (def.children) {
        for (var i in def.children) {
            this.instantiate(def.children[i]);
        }
    }
    
    this.addGameObject(go);
    
    return go;
};

/* Game Loop & State */
Javelin.Engine.prototype.initialize = function() {
    Javelin.initialize();
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
    if (this.running) {
        this.updating = true;
        this.step++;
        this.prevStepTime = this.time;
        this.time = new Date().getTime();
        this.deltaTime = this.time - this.prevStepTime;
    
        this.updateGameObjects(this.deltaTime);
        this.updatePlugins(this.deltaTime);
        this.updating = false;
        
        //TODO: commit go changes (creations/deletions)
    }
};

Javelin.Engine.prototype.updateGameObjects = function(deltaTime) {
    for (var i = 0; i < this.gos.length; i++) {
        //TODO: only process root level objects,
        //the callbacks can be retrieved recursively
        //for nested hierarchies, which will allow
        //for efficient caching
        var cbs = this.gos[i].getCallbacks('update');
        for (var j = 0; j < cbs.length; j++) {
            cbs[j](deltaTime);
        }
    }
};

Javelin.Engine.prototype.updatePlugins = function(deltaTime) {
    for (var plugin in this.plugins) {
        if (plugin.$active) {
            plugin.$step(deltaTime);
        }
    }
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
        this.instantiate(definition.objects[i]);
    }

    callback();
};

/* Plugin Management */
Javelin.Engine.prototype.addPlugin = function(pluginBuilder) {
    var plugin = new Javelin.EnginePlugin();
    plugin.$alias = pluginBuilder.alias;
    plugin.$defaults = pluginBuilder.defaults || {};
    
    //TODO: validate plugin requirements
    
    pluginBuilder(this, plugin, pluginBuilder.$defaults);
    this.plugins.push(plugin);
};

Javelin.Engine.prototype.resetPlugins = function() {
    for (var i in this.plugins) {
        this.plugins[i].$reset();
    }
};

Javelin.Engine.prototype.getPlugin = function(name) {
    for (var i = 0; i < this.plugins.length; i++) {
        if (name === this.plugins[i].$alias) {
            return this.plugins[i];
        }
    }
    
    return false;
};
;"use strict";

Javelin.EnginePlugin = function() {
    this.$alias = '';
    this.$defaults = {};
    this.$requirements = [];
    this.$active = false;
    this.$config = {};
};

Javelin.EnginePlugin.prototype.$reset = function() {
    // body...
};

/* GameObject Lifecycle */
Javelin.EnginePlugin.prototype.$onStep = function(deltaTime) {
    // body...
};

Javelin.EnginePlugin.prototype.$onGameObjectDestroy = function(go) {
    // body...
};

Javelin.EnginePlugin.prototype.$onGameObjectCreate = function(go) {
    // body...
};

/* data import/export for scene configuration */

Javelin.EnginePlugin.prototype.$serialize = function() {
    return this.$config;
};

Javelin.EnginePlugin.prototype.$unserialize = function(data) {
    this.$config = data;
    this.$reset();
};
;/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/


'use strict';

Javelin.Environment = function() {
    
};


Javelin.Environment.prototype.initialize = function() {};

Javelin.Environment.prototype.validatePlugin = function(plugin) {};

Javelin.Environment.prototype.run = function() {};

Javelin.Environment.prototype.stop = function() {};
;/*global Javelin:true */

'use strict';

Javelin.GameObject = function () {
    this.id = -1;                       //UID assigned by engine
    this.name = "Untitled";             //human-readable name (for eventual editor)
    this.engine = null;                 //reference to engine
    this.active = false;                //active flag
    this.components = {};               //component instances
    this.children = [];                 //child gameobject instances
    this.parent = null;                 //parent gameobject instance
    this.containedAliases = [];         //list of compnent aliases contained in object
    this.hasChanges = false;            //whether or not the hierarchy or components have been modified
    this.cbCache = {};
};

/* Lifecycle */
Javelin.GameObject.prototype.destroy = function() {
    if (this.engine) {
        this.engine.removeGameObject(this);
    }
};


/* Component management */
Javelin.GameObject.prototype.addComponent = function(componentConstructor) {
    var componentName = componentConstructor.name;
    if (this.components[componentName]) {
        return;
    }
    
    this.hasChanges = true;

    //add any required components first
    var reqs = Javelin.getRequirementsFor(componentName);
    var l = reqs.length;
    for (var i = 0; i < l; i++) {
        this.addComponent(reqs[i]);
    }
    
    //instantiate new component instance
    var def = new Javelin.GameObjectComponent();
    def.$id = this.id;
    def.$go = this;
    
    //call hierarchy in proper inheritence order
    var handlers = Javelin.getComponentHierarchy(componentName);
    l = handlers.length;
    for (i = 0; i < l; i++) {
        handlers[i](this, def);
        this.containedAliases[handlers[i].name] = true;
    }

    this.components[componentName] = def;
};

Javelin.GameObject.prototype.getComponent = function(name) {
    return this.components[name] || false;
};

Javelin.GameObject.prototype.removeComponent = function(name) {
    this.hasChanges = true;
    this.components[name] = null;
};

Javelin.GameObject.prototype.instanceOf = function(alias) {
    return this.containedAliases[alias] || false;
};

Javelin.GameObject.prototype.getComponentsInChildren = function(name) {
    var components = [];
    
    for (var i = 0; i < this.children.length; i++) {
        var c = this.children[i];
        
        //check nested children recursively
        if (c.children) {
            var comps = c.getComponentsInChildren(name);
            for (var j = 0; j < comps.length; j++) {
                components.push(comps[j]);
            }
        }
        
        //get component of child
        var component = c.getComponent(name);
        if (component) {
            components.push(component);
        }
    }
        
    return components;
};


/* GO Hierarchy management */

Javelin.GameObject.prototype.addChild = function(child) {
    this.hasChanges = true;
    child.hasChanges = true;
    child.parent = this;
    this.children.push(child);
};

Javelin.GameObject.prototype.setParent = function(parent) {
    this.hasChanges = true;
    parent.hasChanges = true;
    parent.addChild(this);
};

Javelin.GameObject.prototype.removeChild = function(child) {
    child.hasChanges = true;
    this.hasChanges = true;
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
};

Javelin.GameObject.prototype.abandon = function() {
    for (var i = 0; i < this.children.length; i++) {
        this.removeChild(this.children[i]);
    }
};


/* Messaging */

Javelin.GameObject.prototype.getCallbacks = function(eventName, recursive) {
    var cbs = [];

    for (var comp in this.components) {
        var cb = comp.$getCallback(eventName);
        if (cb) {
            cb.$id = this.id;
            cbs.push(cb);
        }
    }
    
    //recursively get callbacks in children?
    if (recursive) {
        for (var i = 0; i < this.children.length; i++) {
            var nestedCBs = this.children[i].getCallbacks(eventName, recursive);
            for (var j in nestedCBs) {
                cbs.push(nestedCBs[j]);
            }
        }
    }
    
    return cbs;
};

/* Data Serialization Helpers */

Javelin.GameObject.prototype.serialize = function() {
    var serialized = {
        name: this.name
    };
    
    for (var alias in this.components) {
        serialized[alias] = this.components[alias].$serialize();
    }
    
    return serialized;
};

Javelin.GameObject.prototype.unserialize = function(data) {
    if (data.name) {
        this.name = data.name;
    }
    
    if(data.components) {
        for (var alias in data.components) {
            this.addComponent(Javelin.getComponentHandler(alias));
            this.components[alias].$unserialize(data.components[alias]);
        }
    }
};
;/*global Javelin:true */

/*
A GameObjectComponent is a glorified map of callbacks + a public API for other components to use.
Components are processed by user-defined
scripts that compose the objects internally.  Each user script receives a new blank component
instance.  Callbacks can be regisered on the component to be processed by the Engine plugins.

Callbacks are called directly by whoever processes them - so the exact structure of a given
callback is determined by the part of the engine that is calling it.
*/


'use strict';

Javelin.GameObjectComponent = function() {
    this.$callbacks = {};
    this.$go = {};
    this.$id = 0;
    this.$alias = '';
    this.$inheritedAliases = [];
};

Javelin.GameObjectComponent.prototype.$on = function(name, callback) {
    callback.$id = this.$id;
    this.$callbacks[name] = callback;
};

Javelin.GameObjectComponent.prototype.$getCallback = function(name) {
    return this.$callbacks[name] || false;
};

Javelin.GameObjectComponent.prototype.$serialize = function() {
    var data = {};
    
    //export non-function component properties, excluding the builtins ($)
    for (var key in this) {
        if (typeof(this[key]) !== 'function' && key.charAt(0) !== "$") {
            data[key] = this[key];
        }
    }
    
    return data;
};

Javelin.GameObjectComponent.prototype.$unserialize = function(data) {
    for (var key in data) {
        this[key] = data[key];
    }
};
;'use strict';

Javelin.Component.Renderer3d = function(go, comp) {
    var t = go.getComponent('transform3d');
    
    //initialize requirements
    comp.material = {};
    comp.geometry = {};
    comp.mesh = {};
    
    //note that if you change the material/geometry, you must
    //call getMesh() to actually change the mesh
    comp.getMesh = function() {
        comp.mesh = new THREE.mesh(comp.geometry, comp.material);
        comp.mesh.useQuaternion = true;
        return comp.mesh;
    };
};
Javelin.Component.Renderer3d.alias = 'renderer3d';
Javelin.Component.Renderer3d.requires = [
    Javelin.Component.Transform3d
];

Javelin.register(Javelin.Component.Renderer3d);
;'use strict';

Javelin.Component.Rigidbody3d = function(go, comp) {
    var t = go.getComponent('transform3d');
    
    //rigidbody in cannon will be known as "collider"
    //comp.collider = ....
};
Javelin.Component.Rigidbody3d.alias = "rigidbody3d";
Javelin.Component.Rigidbody3d.requires = [
    Javelin.Component.Transform3d
];
;'use strict';

Javelin.Component.Transform3d = function(go, comp) {
    /* Values are generally relative to parent */
    
    comp.position =  {
        x: 0.0,
        y: 0.0,
        z: 0.0
    };

    comp.rotation = {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        w: 0.0
    };
    
    comp.scale = 1.0;
    
    /* Absolute world coordinates */
    
    //if there's a parent, cache it's transform
    var parentTransform = (go.parent) ? go.parent.getComponent('transform3d') : false;
    
    //absolute world coordinates
    comp.getWorldX = function() {
        return (parentTransform) ? parentTransform.position.x + comp.position.x : comp.position.x;
    };
    comp.getWorldY = function() {
        return (parentTransform) ? parentTransform.position.y + comp.position.y : comp.position.y;
    };
    comp.getWorldZ = function() {
        return (parentTransform) ? parentTransform.position.z + comp.position.z : comp.position.z;
    };
    
    comp.getPositionVector = function() {
        return [comp.position.x, comp.position.y, comp.position.z];
    };
    
    comp.getRotationVector = function() {
        return [comp.rotation.x, comp.rotation.y, comp.rotation.z, comp.rotation.w];
    };
    
    //movement
    comp.translate = function(arr) {
        comp.position.x += arr[0];
        comp.position.y += arr[1];
        comp.position.z += arr[2];
    };
    
    //rotation
    comp.lookAt = function(arr) {
        
    };
};
Javelin.Component.Transform3d.alias = 'transform3d';
Javelin.register(Javelin.Component.Transform3d);
;/*global Javelin:true */

/*
An interface (or something) for functionality that must be implemented in an environment-specific
manner.
*/

'use strict';

Javelin.Environment.Browser = function() {
    this.engine = {};
};

Javelin.Environment.Browser.prototype = new Javelin.Environment();

Javelin.Environment.Browser.prototype.run = function() {
    window.requestAnimationFrame(this.run);
    
    try {
        this.engine.step();
    } catch (e) {
        console.log(e);
    }
};
;/*global Javelin:true */

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
;/*global Javelin:true */

'use strict';

Javelin.Plugin.ThreeJs = function(engine, plugin, config) {
    plugin.config = config;
    plugin.scene = {};
    plugin.renderer = {};
    plugin.activeCamera = {};
    
    plugin.$initialize = function() {
        plugin.$reset();
    };
    
    plugin.$reset = function() {
        //clear the scene
        plugin.scene = new THREE.Scene();

        //figure out renderer based on config
        plugin.renderer = new THREE.WebGLRenderer();
        if (plugin.config.renderer.element) {
            plugin.renderer.setSize(plugin.config.renderer.element.innerWidth, plugin.config.renderer.element.innerHeight);
        } else {
            plugin.renderer.setSize(plugin.config.renderer.width, plugin.config.renderer.height);
        }
        
        //setup "main" camera
        //manually great game object for camera, with camera component, whatever that means
        //and add to engine
        plugin.activeCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        plugin.activeCamera.position.z = 5;
    };
    
    plugin.$loadScene = function(sceneDef) {
        //first: merge config, then reset
        plugin.$reset();
    };
    
    plugin.$onGameObjectDestroy = function(go) {
        var c = go.getComponent('renderer3d');
        if (c) {
            plugin.scene.remove(c.mesh);
        }
    };
    
    plugin.$onGameObjectCreate = function(go) {
        var c = go.getComponent('renderer3d');
        if (c) {
            plugin.scene.add(c.getMesh());
        }
    };
    
    plugin.$step = function(deltaTime) {
        var gos = engine.gos;
        if (deltaTime >= 1000/plugin.config.stepsPerSecond) {
            for (var i = 0; i < gos.length; i++) {
                var c = gos[i].getComponent('renderer3d') || false;
                if(c) {
                    if(gos[i].active) {
                        //update position/rotation data
                        c.mesh.visible = true;
                        c.mesh.position = gos[i].components["transform3d"].position;
                        c.mesh.rotation = gos[i].components["transform3d"].rotation;
                    } else {
                        c.mesh.visible = false;
                    }
                }
            }
            
            //render frame
            plugin.renderer.render(plugin.scene, plugin.activeCamera);
        }
    };
    
    //public api
    plugin.useCamera = function(name) {
        //switch active camera
    };
};

Javelin.Plugin.ThreeJs.alias = "threejs";
Javelin.Plugin.ThreeJs.defaults = {
    renderer: {
        type: "webgl",
        height: 600,
        width: 800,
        element: null
    },
    
};
;
    if (typeof module !== 'undefined') {
        // export for node
        module.exports = Javelin;
    } else {
        // assign to window
        this.Javelin = Javelin;
    }
}).apply(this);