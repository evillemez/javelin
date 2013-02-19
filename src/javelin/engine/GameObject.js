/*global Javelin:true */

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
    this.modified = false;              //whether or not the hierarchy or components have been modified
    this.ownCallbackCache = {};         //cached callbacks from own components
    this.allCallbackCache = {};         //cached callbacks from all children
};

/* Lifecycle */

Javelin.GameObject.prototype.destroy = function() {
    if (this.engine) {
        this.engine.removeGameObject(this);
    }
};


/* Component management */

Javelin.GameObject.prototype.addComponent = function(handler) {
    if (this.components[handler.alias]) {
        return this.components[handler.alias];
    }
    
    this.setModified();

    //add any required components first
    var reqs = Javelin.getComponentRequirements(handler.alias);
    var l = reqs.length;
    for (var i = 0; i < l; i++) {
        this.addComponent(reqs[i]);
    }
    
    //instantiate new component instance
    var comp = new Javelin.GameObjectComponent();
    comp.$id = this.id;
    comp.$go = this;
    comp.$alias = handler.alias;
    
    //call hierarchy in proper inheritence order
    var handlers = Javelin.getComponentChain(handler.alias);
    l = handlers.length;
    for (i = 0; i < l; i++) {
        handlers[i](this, comp);
        comp.$inheritedAliases.push(handlers[i].alias);
        this.containedAliases[handlers[i].alias] = true;
    }

    this.components[handler.alias] = comp;
    
    return comp;
};

Javelin.GameObject.prototype.getComponent = function(name) {
    if (this.components[name]) {
        return this.components[name];
    }
    
    for (var comp in this.components) {
        if (this.components[comp].$instanceOf(name)) {
            return this.components[comp];
        }
    }

    return false;
};

Javelin.GameObject.prototype.hasComponent = function(name) {
    if (this.components[name]) {
        return true;
    }
    
    for (var comp in this.components) {
        if (this.components[comp].$instanceOf(name)) {
            return true;
        }
    }
    
    return false;
};

Javelin.GameObject.prototype.removeComponent = function(name) {
    this.setModified();
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
    this.setModified();
    child.setModified();
    child.parent = this;
    this.children.push(child);
};

Javelin.GameObject.prototype.setParent = function(parent) {
    this.setModified();
    parent.setModified();
    parent.addChild(this);
};

Javelin.GameObject.prototype.removeChild = function(child) {
    child.setModified();
    this.setModified();
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
};

Javelin.GameObject.prototype.abandon = function() {
    for (var i = 0; i < this.children.length; i++) {
        this.removeChild(this.children[i]);
    }
};


/* Messaging */

Javelin.GameObject.prototype.emit = function(name, data) {
    //TODO: fill in
};

Javelin.GameObject.prototype.broadcast = function(name, data) {
    //TODO: fill in
};

Javelin.GameObject.prototype.getCallbacks = function(eventName, recursive) {
    if (this.modified) {
        this.rebuildCallbackCache();
    }
    
    return (recursive) ? this.allCallbackCache[eventName] || []: this.ownCallbackCache[eventName] || [];
};

Javelin.GameObject.prototype.rebuildCallbackCache = function() {
    var ownCallbacks = {};
    for (var comp in this.components) {
        for (var key in this.components[comp].$callbacks) {
            ownCallbacks[key] = ownCallbacks[key] || [];
            ownCallbacks[key].push(this.components[comp].$callbacks[key]);
        }
    }
    
    this.ownCallbackCache = ownCallbacks;
    
    var allCallbacks = ownCallbacks;
    for (var i in this.children) {
        if (this.children[i].modified) {
            this.children[i].rebuildCallbackCache();
        }
        
        for (var eventName in this.children[i].$allCallbackCache) {
            for (var j in this.children[i].$allCallbackCache[eventName]) {
                allCallbacks[eventName].push(this.children[i].$allCallbackCache[eventName][j]);
            }
        }
    }
    
    this.allCallbackCache = allCallbacks;
};

Javelin.GameObject.prototype.setModified = function() {
    this.modified = true;
    if (this.parent) {
        this.parent.setModified();
    }
};

/* Data Serialization Helpers */

Javelin.GameObject.prototype.serialize = function() {
    var serialized = {
        name: this.name
    };
    
    for (var alias in this.components) {
        serialized[alias] = this.components[alias].$serialize();
    }
    
    if (this.children.length > 0) {
        serialized.children = [];
        for (var index in this.children) {
            serialized.children.push(this.children[index].serialize());
        }
    }
    
    return serialized;
};

Javelin.GameObject.prototype.unserialize = function(data) {
    if (data.name) {
        this.name = data.name;
    }
    
    if (data.components) {
        for (var alias in data.components) {
            this.components[alias].$unserialize(data.components[alias]);
        }
    }
    
    if (data.children) {
        for (var index in data.children) {
            this.children[index].unserialize(data.children[index]);
        }
    }
};
