(function() {

    var Javelin = Javelin || {};

    Javelin.Plugin = {};
    Javelin.Component = {};

    ;'use strict';

var Javelin = Javelin || {};

//setup sub namespaces
Javelin.Plugin = {};
Javelin.Component = {};;/*global Javelin:true */

'use strict';

Javelin.Engine = function(config) {
    //this value persists always
    this.config = config;
    
    //everything else can be reset
    this.reset();
};

Javelin.Engine.prototype.reset = function() {
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

    for (var plugin in definition.plugins) {
        this.plugins[plugin] = {};
    }

    callback(this);
};


/* Plugin Management */;/*global Javelin:true */

'use strict';

Javelin.GameObject = function () {
    this.id = -1;
    this.engine = null;
    this.active = false;
    this.components = {};
    this.children = [];
    this.parent = null;
};

/* Lifecycle */
Javelin.GameObject.prototype.destroy = function() {
    if (this.engine) {
        this.engine.removeGameObject(this);
    }
};


/* Component management */

/* 
 * @todo check for requirements
 * @todo check for decorator
 * @todo check for required engine plugins
 */
Javelin.GameObject.prototype.addComponent = function(componentConstructor) {
    var def = new Javelin.GameObjectComponent();
    componentConstructor(this, def);
    def.$go = this;
    this.components[componentConstructor.name] = def;
};

Javelin.GameObject.prototype.getComponent = function(name) {
    return this.components[name] || false;
};

Javelin.GameObject.prototype.removeComponent = function(name) {
    this.components[name] = null;
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


/* Hierarchy management */

Javelin.GameObject.prototype.addChild = function(child) {
    child.parent = this;
    this.children.push(child);
};

Javelin.GameObject.prototype.setParent = function(parent) {
    parent.addChild(this);
};

Javelin.GameObject.prototype.removeChild = function(child) {
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
};

Javelin.GameObject.prototype.abandon = function() {
    for (var i = 0; i < this.children.length; i++) {
        this.removeChild(this.children[i]);
    }
};


/* Messaging */

Javelin.GameObject.prototype.getCallbacks = function(eventName) {
    var cbs = [];

    for (var comp in this.components) {
        var cb = comp.$getCallback(eventName);
        if (cb) {
            cbs.push(cb);
        }
    }
    
    return cbs;
};

/* Data Serialization Helpers */

Javelin.GameObject.prototype.serialize = function() {
    //TODO: aggregate component exports
};

Javelin.GameObject.prototype.unserialize = function(data) {
    if (data.plugins) {
        
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
    this.$go = null;
};


Javelin.GameObjectComponent.prototype.$on = function(name, callback) {
    this.$callbacks[name] = callback;
};

Javelin.GameObjectComponent.prototype.$getCallback = function(name) {
    return this.$callbacks[name] || false;
};

Javelin.GameObjectComponent.prototype.$serialize = function() {
    var data = {};

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
;/*global Javelin:true */

'use strict';

Javelin.Component.Transform3d = function(go, comp) {
    this.name = "transform3d";
    this.requiredPlugins = [
        "ThreeJs"
    ];
    
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
        quaternion: 0.0
    };
    
    /* Absolute world coordinates */
    
    var parentTransform = (go.parent) ? go.parent.getComponent('transform3d') : false;
    
    comp.position.worldX = function() {
        return (parentTransform) ? parentTransform.position.x + comp.position.x : comp.position.x;
    };
    comp.position.worldY = function() {};
    comp.position.worldZ = function() {};
    
    comp.rotation.worldX = function() {};
    comp.rotation.worldY = function() {};
    comp.rotation.worldZ = function() {};
};
;/*global Javelin:true */

'use strict';

Javelin.Plugin.ThreeJs = function(engine, config, plugin) {
    plugin.config = config;
    plugin.scene = {};
    
    plugin.init = function() {
        
    };
    
    plugin.onGameObjectDestroy = function(go) {
        var c = go.getComponent('transform3d');
        if (c) {
            
        }
    };
    
    plugin.onGameObjectCreate = function(go) {
        var c = go.getComponent('transform3d');
        if (c) {
            
        }
    };
    
    plugin.step = function(deltaTime) {
        if (deltaTime >= 1000/config.stepsPerSecond) {
            for (var go in engine.gos) {
                if(go.active) {
                    //todo...something
                }
            }
        }
    };
};;
    if (typeof module !== 'undefined') {
        // export for node
        module.exports = Javelin;
    } else {
        // assign to window
        this.Javelin = Javelin;
    }
}).apply(this);