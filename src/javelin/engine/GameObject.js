/*global Javelin:true */

'use strict';

Javelin.GameObject = function () {
    this.id = -1;                                   //UID assigned by engine
    this.name = "Anonymous";                        //human-readable name (for eventual editor)
    this.engine = null;                             //reference to engine
    this.enabled = false;                           //active flag
    this.components = {};                           //component instances
    this.children = [];                             //child gameobject instances
    this.parent = null;                             //parent gameobject instance
    this.dispatcher = new Javelin.Dispatcher();     //for emit/broadcast functionality
    this.root = null;                               //TODO: implement, if in a hierarchy, reference to root object in hierarcy
    this.modified = false;                          //whether or not the hierarchy or components have been modified
    this.ownCallbackCache = {};                     //cached callbacks from own components
    this.allCallbackCache = {};                     //cached callbacks from all children
    this.tags = [];                                 //string tags for categorizing objects
    this.layer = 'default';                         //for assigning groups of objects to specific layers (may be removed)
};

/* Lifecycle */

Javelin.GameObject.prototype.destroy = function() {
    if (this.engine) {
        this.engine.destroy(this);
    }
};

Javelin.GameObject.prototype.setId = function(id) {
    this.id = id;
    
    for (var alias in this.components) {
        this.components[alias].$id = id;
    }
};

Javelin.GameObject.prototype.enable = function() {
    this.enabled = true;

    if (this.children) {
        for (var index in this.children) {
            this.children[index].enable();
        }
    } else {
        //set modified bubbles up, so we only need to call it
        //if we don't have children
        this.setModified();
    }
};

Javelin.GameObject.prototype.disable = function() {
    this.enabled = false;
    
    if (this.children) {
        for (var index in this.children) {
            this.children[index].disable();
        }
    } else {
        //set modified bubbles up, so we only need to call it
        //if we don't have children
        this.setModified();
    }
};

/* Component management */

//explicitly set a component instance
Javelin.GameObject.prototype.setComponent = function(alias, component) {
    
    component.$alias = alias;
    component.$id = this.id;

    //TODO: make this better somehow
    //this is making sure we don't set two component instances
    //which have inherited from a component that has already been added
    //... this sucks, and it is probably a case that should not happen anyway,
    //if it shouldn't happen, it should be detected and throw errors during initialize
    for (var key in this.components) {
        if (component.$instanceOf(key)) {
            return;
        }
    }
    
    this.components[alias] = component;

    this.setModified();
};

//micro optimization to set multiple components without having to call setModified() every time
Javelin.GameObject.prototype.setComponents = function(arr) {
    for (var i in arr) {
        var comp = arr[i];
        comp.$id = this.id;
        this.components[comp.$alias] = comp;
    }

    this.setModified();
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
    
    for (var alias in this.components) {
        if (this.components[alias].$instanceOf(name)) {
            return true;
        }
    }
    
    return false;
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

/* tag management */

Javelin.GameObject.prototype.hasTag = function(name) {
    return (-1 !== this.tags.indexOf(name));
};

Javelin.GameObject.prototype.addTag = function(name) {
    if (!this.hasTag(name)) {
        this.tags.push(name);
    }
};

Javelin.GameObject.prototype.removeTag = function(name) {
    if (this.hasTag(name)) {
        this.tags.splice(this.tags.indexOf(name), 1);
    }
};

Javelin.GameObject.prototype.getTags = function() {
    return this.tags;
};

Javelin.GameObject.prototype.getChildrenByTag = function(name, recursive) {
    var children = [];
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].hasTag(name)) {
            children.push(this.children[i]);
        }
        
        if (recursive) {
            var nested = this.children[i].getChildrenByTag(name, true);
            if (nested) {
                for (var j in nested) {
                    children.push(nested[j]);
                }
            }
        }
    }
    
    return children;
};


/* GO Hierarchy management */

Javelin.GameObject.prototype.isRoot = function() {
    return (null === this.root);
};

Javelin.GameObject.prototype.getRoot = function() {
    return (this.isRoot()) ? this : this.root;
};

Javelin.GameObject.prototype.setRoot = function(go) {
    this.root = go;
    for (var i in this.children) {
        this.children[i].setRoot(go);
    }
};

Javelin.GameObject.prototype.addChild = function(child) {
    //don't allow an object to be a child of more
    //that one parent
    if (child.parent) {
        child.parent.removeChild(child);
    }
    
    this.setModified();
    child.setModified();
    child.parent = this;
    child.setRoot(this.getRoot());
    this.children.push(child);
};

Javelin.GameObject.prototype.setParent = function(parent) {
    parent.addChild(this);
};

Javelin.GameObject.prototype.removeChild = function(child) {
    child.setModified();
    this.setModified();
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
};

Javelin.GameObject.prototype.leaveParent = function() {
    if (this.parent) {
        this.parent.removeChild(this);
    }
};

Javelin.GameObject.prototype.abandonChildren = function() {
    for (var i = 0; i < this.children.length; i++) {
        this.removeChild(this.children[i]);
    }
};

Javelin.GameObject.prototype.hasChildren = function() {
    return (this.children.length > 0);
};

Javelin.GameObject.prototype.hasParent = function() {
    return this.parent ? true : false;
};


/* Messaging */

Javelin.GameObject.prototype.on = function(name, listener) {
    this.dispatcher.on(name, listener);
};


Javelin.GameObject.prototype.emit = function(name, data) {
    if (this.dispatcher.dispatch(name, data)) {
        if (this.parent) {
            this.parent.emit(name, data);
        }
        if (this.isRoot() && this.engine) {
            this.engine.emit(name, data);
        }
    }
};

Javelin.GameObject.prototype.broadcast = function(name, data) {
    if (this.dispatcher.dispatch(name, data)) {
        if (this.children) {
            for (var i = 0; i < this.children.length; i++) {
                if (!this.children[i].broadcast(name, data)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    return false;
};

Javelin.GameObject.prototype.getCallbacks = function(eventName, recursive) {
    if (this.modified) {
        this.rebuildCallbackCache();
        this.modified = false;
    }
    
    return (recursive) ? this.allCallbackCache[eventName] || [] : this.ownCallbackCache[eventName] || [];
};

Javelin.GameObject.prototype.rebuildCallbackCache = function() {
    var key, cb, i, ownCallbacks = {};
    for (var comp in this.components) {
        for (key in this.components[comp].$callbacks) {
            ownCallbacks[key] = ownCallbacks[key] || [];
            ownCallbacks[key].push(this.components[comp].$callbacks[key]);
        }
    }
    
    this.ownCallbackCache = ownCallbacks;
    
    //clone own callbacks into new object
    var allCallbacks = {};
    for (key in ownCallbacks) {
        allCallbacks[key] = allCallbacks[key] || [];
        for (i in ownCallbacks[key]) {
            allCallbacks[key].push(ownCallbacks[key][i]);
        }
    }
    
    //now add all callbacks from children
    for (i in this.children) {
        var child = this.children[i];
        
        if (child.modified) {
            child.rebuildCallbackCache();
            child.modified = false;
        }
        
        for (var eventName in child.allCallbackCache) {
            allCallbacks[eventName] = allCallbacks[eventName] || [];
            
            for (i in child.allCallbackCache[eventName]) {
                allCallbacks[eventName].push(child.allCallbackCache[eventName][i]);
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

Javelin.GameObject.prototype.export = function() {
    var serialized = {
        name: this.name,
        layer: this.layer,
        tags: this.tags,
        components: {}
    };
    
    for (var alias in this.components) {
        serialized.components[alias] = this.components[alias].$serialize();
    }
    
    if (this.children.length > 0) {
        serialized.children = [];
        for (var index in this.children) {
            serialized.children.push(this.children[index].export());
        }
    }
    
    return serialized;
};
