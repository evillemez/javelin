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
