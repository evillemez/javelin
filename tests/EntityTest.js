'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;
var Javelin = require('../build/javelin/javelin.core.js');

describe("Entity", function() {
    
    it("should instantiate properly", function() {
        var ent = new Javelin.Entity();
        assert.isTrue(ent instanceof Javelin.Entity);
        assert.strictEqual(ent.name, 'Anonymous');
        assert.strictEqual(ent.id, -1);
    });
    
    it("should allow setting component instances", function() {
        var ent = new Javelin.Entity();
        var c = new Javelin.Component();
        assert.isFalse(ent.hasComponent('foo'));
        assert.isFalse(ent.get('foo'));
        
        ent.setComponent('foo', c);
        assert.isTrue(ent.hasComponent('foo'));
        assert.isObject(ent.get('foo'));
        
        ent = new Javelin.Entity();
        var c1 = new Javelin.Component();
        c1.$alias = 'foo';
        var c2 = new Javelin.Component();
        c2.$alias = 'bar';
        assert.isFalse(ent.hasComponent('foo'));
        assert.isFalse(ent.hasComponent('bar'));
        ent.setComponents([c1, c2]);
        assert.isTrue(ent.hasComponent('foo'));
        assert.isTrue(ent.hasComponent('bar'));
        assert.isTrue(ent.modified);
    });
    
    it("should be modified if a component is added", function() {
        var ent = new Javelin.Entity();
        assert.isFalse(ent.modified);
        ent.setComponent('foo', new Javelin.Component());
        assert.isTrue(ent.modified);
    });
    
    it("should accept and remove child game objects", function() {
        var parent = new Javelin.Entity();
        var child = new Javelin.Entity();
        assert.isFalse(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isFalse(child.hasParent());
        
        parent.addChild(child);
        assert.isTrue(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isTrue(child.hasParent());
        
        parent.removeChild(child);
        assert.isFalse(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isFalse(child.hasParent());
        
        child.setParent(parent);
        assert.isTrue(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isTrue(child.hasParent());
        
        child.leaveParent();
        assert.isFalse(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isFalse(child.hasParent());
        
        parent.addChild(child);
        assert.isTrue(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isTrue(child.hasParent());
        
        parent.abandonChildren();
        assert.isFalse(parent.hasChildren());
        assert.isFalse(parent.hasParent());
        assert.isFalse(child.hasChildren());
        assert.isFalse(child.hasParent());
    });

    it("should set and cascade id to components", function() {
        var ent, c1, c2;
        
        ent = new Javelin.Entity();
        c1 = new Javelin.Component();
        c2 = new Javelin.Component();
        ent.setComponent('foo', c1);
        ent.setComponent('bar', c2);
        
        assert.strictEqual(-1, ent.id);
        assert.strictEqual(-1, c1.$id);
        assert.strictEqual(-1, c2.$id);
        
        //set id and cascade down to already existing components
        ent.setId(3);
        assert.strictEqual(3, ent.id);
        assert.strictEqual(3, c1.$id);
        assert.strictEqual(3, c2.$id);
        
        //set id before adding new components
        ent = new Javelin.Entity();
        c1 = new Javelin.Component();
        c2 = new Javelin.Component();
        assert.strictEqual(-1, ent.id);
        ent.setId(3);
        ent.setComponent('foo', c1);
        ent.setComponent('bar', c2);
        assert.strictEqual(3, ent.id);
        assert.strictEqual(3, c1.$id);
        assert.strictEqual(3, c2.$id);
    });
    
    it("should set and filter up modified", function() {
        var parent = new Javelin.Entity();
        var child = new Javelin.Entity();
        assert.isFalse(parent.modified);
        assert.isFalse(child.modified);
        
        parent.addChild(child);
        assert.isTrue(parent.modified);
        assert.isTrue(child.modified);
        parent.modified = false;
        child.modified = false;
        assert.isFalse(parent.modified);
        assert.isFalse(child.modified);
        
        //test bubble up
        child.setModified();
        assert.isTrue(parent.modified);
        assert.isTrue(child.modified);
        parent.modified = false;
        child.modified = false;
        
        //adding a new child should modify the parent, but not existing children
        var child2 = new Javelin.Entity();
        parent.addChild(child2);
        assert.isTrue(parent.modified);
        assert.isTrue(child2.modified);
        assert.isFalse(child.modified);
    });
    
    it("should set and cascade enabled", function() {
        var parent = new Javelin.Entity();
        var child1 = new Javelin.Entity();
        var child2 = new Javelin.Entity();
        
        assert.isFalse(parent.enabled);
        assert.isFalse(child1.enabled);
        assert.isFalse(child2.enabled);
        parent.enable();
        assert.isTrue(parent.enabled);
        parent.disable();
        assert.isFalse(parent.enabled);
        
        parent.addChild(child1);
        parent.addChild(child2);
        parent.enable();
        assert.isTrue(parent.enabled);
        assert.isTrue(child1.enabled);
        assert.isTrue(child2.enabled);
        parent.disable();
        assert.isFalse(parent.enabled);
        assert.isFalse(child1.enabled);
        assert.isFalse(child2.enabled);
    });
    
    it("should assemble callback cache properly", function() {
        var c1 = new Javelin.Component();
        c1.$on('engine.update', function() {});
        var c2 = new Javelin.Component();
        c2.$on('engine.update', function() {});
        
        var parent = new Javelin.Entity();
        var child1 = new Javelin.Entity();
        var child2 = new Javelin.Entity();
        
        parent.setComponent('foo', c1);
        parent.setComponent('bar', c2);
        
        //test parent alone
        assert.isTrue(parent.modified);
        assert.strictEqual(2, parent.getCallbacks('engine.update').length);
        assert.strictEqual(2, parent.getCallbacks('engine.update', true).length);
        assert.isFalse(parent.modified);
        
        //now setup children and do the same assertions
        child1.setComponent('foo', c1);
        child1.setComponent('bar', c2);
        child2.setComponent('foo', c1);
        child2.setComponent('bar', c2);
        assert.strictEqual(2, child1.getCallbacks('engine.update').length);
        assert.strictEqual(2, child2.getCallbacks('engine.update').length);
        parent.addChild(child1);
        parent.addChild(child2);
        assert.isTrue(parent.modified);
        assert.isTrue(child1.modified);
        assert.isTrue(child2.modified);
        
        //did the callbacks come back from the children as well?
        assert.strictEqual(2, parent.getCallbacks('engine.update').length);
        assert.strictEqual(6, parent.getCallbacks('engine.update', true).length);
        assert.isFalse(parent.modified);
        assert.isFalse(child1.modified);
        assert.isFalse(child2.modified);
        
        //test actual getCallback method
        var cbs;
        cbs = parent.getCallbacks('engine.update');
        assert.strictEqual(2, cbs.length);
        for (var i in cbs) {
            assert.isFunction(cbs[i]);
        }
        cbs = parent.getCallbacks('engine.update', true);
        assert.strictEqual(6, cbs.length);
        for (i in cbs) {
            assert.isFunction(cbs[i]);
        }
        cbs = parent.getCallbacks('fooooooo');
        assert.strictEqual(0, cbs.length);
        cbs = parent.getCallbacks('fooooooo', true);
        assert.strictEqual(0, cbs.length);
    });

    it("should serialize to prefab structure", function () {
        var parent = new Javelin.Entity();
        var child1 = new Javelin.Entity();
        var child2 = new Javelin.Entity();
        parent.name = 'parent';
        child1.name = 'child1';
        child2.name = 'child2';
        
        var c1 = new Javelin.Component();
        c1.foo = 'bar';
        var c2 = new Javelin.Component();
        c2.foo = 'baz';
        
        child1.setComponent('bar', c1);
        child2.setComponent('baz', c2);
        
        parent.addChild(child1);
        parent.addChild(child2);
        
        var expected = {
            name: 'parent',
            layer: 'default',
            tags: [],
            components: {},
            children: [
                {
                    name: 'child1',
                    layer: 'default',
                    tags: [],
                    components: {
                        'bar': {
                            foo: 'bar'
                        }
                    }
                },
                {
                    name: 'child2',
                    layer: 'default',
                    tags: [],
                    components: {
                        'baz': {
                            foo: 'baz'
                        }
                    }
                }
            ]
        };
        
        //finally serialize
        assert.deepEqual(expected, parent.serialize());
    });

    it("should get all components in children by type", function() {
        var p = new Javelin.Entity();
        var c1 = new Javelin.Entity();
        var c2 = new Javelin.Entity();
        var c3 = new Javelin.Entity();
        p.addChild(c1);
        p.addChild(c2);
        c2.addChild(c3);
        c1.setComponent('foo', new Javelin.Component());
        c3.setComponent('foo', new Javelin.Component());
        
        assert.deepEqual(p.getComponentsInChildren('bar'), []);
        assert.strictEqual(p.getComponentsInChildren('foo').length, 2);
    });

    it("should properly mark the root object in a parent/child hierarchy", function() {
        var p = new Javelin.Entity();
        var c1 = new Javelin.Entity();
        var c2 = new Javelin.Entity();
        var c3 = new Javelin.Entity();
        p.id = 1;
        c1.id = 2;
        c2.id = 3;
        c3.id = 4;
        
        assert.isTrue(p.isRoot());
        assert.isTrue(c1.isRoot());
        assert.isTrue(c2.isRoot());
        assert.isTrue(c3.isRoot());

        c1.setParent(p);
        c2.setParent(p);
        c3.setParent(c1);

        assert.isTrue(p.isRoot());
        assert.isFalse(c1.isRoot());
        assert.isFalse(c2.isRoot());
        assert.isFalse(c3.isRoot());
        assert.strictEqual(c1.getRoot().id, 1);
        assert.strictEqual(c2.getRoot().id, 1);
        assert.strictEqual(c3.getRoot().id, 1);
    });

    it("should manage tags", function() {
        var ent = new Javelin.Entity();
        
        assert.isFalse(ent.hasTag('foo'));
        assert.isFalse(ent.hasTag('bar'));
        ent.addTag('foo');
        assert.isTrue(ent.hasTag('foo'));
        assert.isFalse(ent.hasTag('bar'));
        ent.addTag('bar');
        assert.isTrue(ent.hasTag('foo'));
        assert.isTrue(ent.hasTag('bar'));
        assert.deepEqual(ent.getTags(), ['foo','bar']);
        ent.removeTag('foo');
        assert.isFalse(ent.hasTag('foo'));
        assert.isTrue(ent.hasTag('bar'));
        ent.removeTag('bar');
        assert.isFalse(ent.hasTag('foo'));
        assert.isFalse(ent.hasTag('bar'));
    });
    
    it("should allow retrieving children by tag", function() {
        var parent = new Javelin.Entity();
        var c1 = new Javelin.Entity();
        var c2 = new Javelin.Entity();
        var c3 = new Javelin.Entity();
        var c4 = new Javelin.Entity();
        
        parent.addChild(c1);
        parent.addChild(c2);
        c2.addChild(c3);
        c3.addChild(c4);
        c4.addTag('foo');
        c1.addTag('foo');
        
        var children = parent.getChildrenByTag('foo');
        assert.strictEqual(1, children.length);
        
        children = parent.getChildrenByTag('foo', true);
        assert.strictEqual(2, children.length);
    });

    it("should broadcast events to children", function() {
        var parent = new Javelin.Entity();
        var child = new Javelin.Entity();
        var child2 = new Javelin.Entity();
        parent.addChild(child);
        
        var parentCalled = false;
        var childCalled = false;
        
        child.on('foo', function(data) {
            assert.isTrue(parentCalled);
            assert.strictEqual(5, data.foo);
        });
        
        child2.on('foo', function(data) {
            assert.isFalse(childCalled);
            assert.isTrue(parentCalled);
            assert.strictEqual(5, data.foo);
            childCalled = true;
        });
        
        parent.on('foo', function(data) {
            assert.isFalse(childCalled);
            assert.strictEqual(5, data.foo);
            parentCalled = true;
        });
        
        parent.broadcast('foo', {foo: 5});
        assert.isTrue(parentCalled);
    });
    
    it("should emit events to parents", function() {
        var parent = new Javelin.Entity();
        var child = new Javelin.Entity();
        parent.addChild(child);
        
        var parentCalled = false;
        var childCalled = false;
        
        child.on('foo', function(data) {
            childCalled = true;
            assert.isFalse(parentCalled);
            assert.strictEqual(5, data.foo);
        });
        
        parent.on('foo', function(data) {
            assert.strictEqual(5, data.foo);
            assert.isTrue(childCalled);
            parentCalled = true;
        });
        
        child.emit('foo', {foo: 5});
        assert.isTrue(parentCalled);
    });

});
