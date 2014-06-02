/**
 * Entities are processed by the engine.  Entities contain components that implement custom
 * game logic.
 * 
 * @param {string} name
 * @param {int} id
 */
Javelin.Entity = function (name, id) {
    this.id = id || -1;                             //UID assigned by engine
    this.name = name || "Anonymous";                //human-readable name (for eventual editor)
    this.engine = null;                             //reference to engine
    this.enabled = false;                           //active flag
    this.components = {};                           //component instances
    this.children = [];                             //child entity instances
    this.parent = null;                             //parent entity instance
    this.root = null;                               //TODO: implement, if in a hierarchy, reference to root object in hierarcy
    this.tags = [];                                 //string tags for categorizing objects
    this.layer = 'default';                         //for assigning groups of objects to specific layers (may be removed)
    this.reference = { entity: null };              //for other entities to store "weak" references
    this.listeners = {};                            //entity event listeners
};

/* Lifecycle */

Javelin.Entity.prototype.destroy = function() {
    this.broadcast('entity.destroy');
  
    if (this.engine) {
        this.engine.destroy(this);
    }
};

Javelin.Entity.prototype.setId = function(id) {
    this.id = id;

    this.reference.entity = (id === -1) ? null : this;
  
    for (var alias in this.components) {
        this.components[alias].$id = id;
    }
};

Javelin.Entity.prototype.enable = function() {
    this.enabled = true;
    this.dispatch('entity.enable');

    if (this.children) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].enable();
        }
    }
};

Javelin.Entity.prototype.disable = function() {
    this.dispatch('entity.disable');
    
    if (this.children) {
        for (var index in this.children) {
            this.children[index].disable();
        }
    }

    this.enabled = false;
};

/* Component management */

//explicitly set a component instance
Javelin.Entity.prototype.setComponent = function(alias, component) {    
    component.$alias = alias;
    component.$id = this.id;
    this.components[alias] = component;
};

Javelin.Entity.prototype.get = function(name) {
    return this.components[name] || false;
};

Javelin.Entity.prototype.hasComponent = function(name) {
    if (this.components[name]) {
        return true;
    }
    
    return false;
};

Javelin.Entity.prototype.getComponentsInChildren = function(name) {
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
        var component = c.get(name);
        if (component) {
            components.push(component);
        }
    }
        
    return components;
};

/* tag management */

Javelin.Entity.prototype.hasTag = function(name) {
    return (-1 !== this.tags.indexOf(name));
};

Javelin.Entity.prototype.addTag = function(name) {
    if (!this.hasTag(name)) {
        this.tags.push(name);
    }
};

Javelin.Entity.prototype.removeTag = function(name) {
    if (this.hasTag(name)) {
        this.tags.splice(this.tags.indexOf(name), 1);
    }
};

Javelin.Entity.prototype.getTags = function() {
    return this.tags;
};

Javelin.Entity.prototype.getChildrenByTag = function(name, recursive) {
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


/* Entity Hierarchy management */

Javelin.Entity.prototype.isRoot = function() {
    return (null === this.root);
};

Javelin.Entity.prototype.getRoot = function() {
    return (this.isRoot()) ? this : this.root;
};

Javelin.Entity.prototype.setRoot = function(go) {
    this.root = go;
    for (var i in this.children) {
        this.children[i].setRoot(go);
    }
};

Javelin.Entity.prototype.addChild = function(child) {
    //notify old parent of child removal, if necessary
    var oldParent = null;
    if (child.parent) {
        oldParent = child.parent;
        child.parent.removeChild(child);
    }
    
    //set new child parent, add as child
    child.parent = this;    
    child.setRoot(this.getRoot());
    this.children.push(child);
    
    //notify entities of hierarchy change
    child.dispatch('entity.parent', [oldParent, this]);
    this.dispatch('entity.child.add', [child]);

};

Javelin.Entity.prototype.setParent = function(parent) {
    parent.addChild(this);
};

Javelin.Entity.prototype.removeChild = function(child) {
    child.parent = null;
    this.children.splice(this.children.indexOf(child), 1);
    this.dispatch('entity.child.remove', [child]);
};

Javelin.Entity.prototype.leaveParent = function() {
    if (this.parent) {
        this.parent.removeChild(this);
    }
};

Javelin.Entity.prototype.abandonChildren = function() {
    for (var i = 0; i < this.children.length; i++) {
        this.removeChild(this.children[i]);
    }
};

Javelin.Entity.prototype.hasChildren = function() {
    return (this.children.length > 0);
};

Javelin.Entity.prototype.hasParent = function() {
    return this.parent ? true : false;
};


/* Messaging */

/**
 * Register a callback for the engine.
 * 
 * One of the main jobs of a component is to register callbacks for the engine, or
 * the engine's plugins.
 * 
 * @param {string} name 
 * @param {function} callback  The format for the callbacks args depend on the event.
 */
Javelin.Entity.prototype.on = function(name, listener) {
    this.listeners[name] = this.listeners[name] || [];
    this.listeners[name].push(listener);
};


Javelin.Entity.prototype.dispatch = function(name, data) {
    var listeners = this.listeners[name];

    if (!listeners) {
        return;
    }    
    
    for (var i = 0; i < listeners.length; i++) {
        listeners[i].apply(null, data);
    }
};

Javelin.Entity.prototype.emit = function(name, data) {
    this.dispatch(name, data);
    
    if (this.parent) {
        this.parent.emit(name, data);
    } else if (this.engine && this.isRoot()) {
        this.engine.emit(name, data);
    }
};

Javelin.Entity.prototype.broadcast = function(name, data) {
    this.dispatch(name, data);
    
    if (this.children) {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].broadcast(name, data);
        }
    }
};

/* Data Serialization Helpers */

Javelin.Entity.prototype.serialize = function() {
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
            serialized.children.push(this.children[index].serialize());
        }
    }
    
    return serialized;
};
