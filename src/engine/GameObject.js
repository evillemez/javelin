/*global Javelin:true */

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
