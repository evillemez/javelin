'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("GameObject", function() {
    
    var j, f;
    
    beforeEach(function() {
        j = require('../build/javelin.js');
        f = require('./fixtures/fixtures.js');
        j.reset();
    });
    
    it("should instantiate properly", function() {
        var go = new j.GameObject();
        assert.isTrue(go instanceof j.GameObject);
    });
    
    it("should allow setting component instances", function() {
        var go = new j.GameObject();
        var c = new j.GameObjectComponent();
        c.$inheritedAliases.push('foo');
        c.$inheritedAliases.push('bar');
        assert.isFalse(go.hasComponent('foo'));
        assert.isFalse(go.hasComponent('bar'));
        assert.isFalse(go.getComponent('foo'));
        assert.isFalse(go.getComponent('bar'));
        
        go.setComponent('foo', c);
        assert.isTrue(go.hasComponent('foo'));
        assert.isTrue(go.hasComponent('bar'));
        assert.isObject(go.getComponent('foo'));
        assert.isObject(go.getComponent('bar'));
        assert.equal(go.getComponent('foo'), go.getComponent('bar'));
        
        go = new j.GameObject();
        var c1 = new j.GameObjectComponent();
        c1.$alias = 'foo';
        c1.$inheritedAliases.push('foo');
        var c2 = new j.GameObjectComponent();
        c2.$alias = 'bar';
        c2.$inheritedAliases.push('bar');
        assert.isFalse(go.hasComponent('foo'));
        assert.isFalse(go.hasComponent('bar'));
        go.setComponents([c1, c2]);
        assert.isTrue(go.hasComponent('foo'));
        assert.isTrue(go.hasComponent('bar'));
        assert.isTrue(go.modified);
    });
    
    it("should be modified if a component is added", function() {
        var go = new j.GameObject();
        assert.isFalse(go.modified);
        go.setComponent('foo', new j.GameObjectComponent());
        assert.isTrue(go.modified);
    });
    
    it("should accept and remove child game objects", function() {
        var parent = new j.GameObject();
        var child = new j.GameObject();
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

    it("should set and cascade gameObject id to components", function() {
        var go, c1, c2;
        
        go = new j.GameObject();
        c1 = new j.GameObjectComponent();
        c2 = new j.GameObjectComponent();
        go.setComponent('foo', c1);
        go.setComponent('bar', c2);
        
        assert.strictEqual(-1, go.id);
        assert.strictEqual(-1, c1.$id);
        assert.strictEqual(-1, c2.$id);
        
        //set id and cascade down to already existing components
        go.setId(3);
        assert.strictEqual(3, go.id);
        assert.strictEqual(3, c1.$id);
        assert.strictEqual(3, c2.$id);
        
        //set id before adding new components
        go = new j.GameObject();
        c1 = new j.GameObjectComponent();
        c2 = new j.GameObjectComponent();
        assert.strictEqual(-1, go.id);
        assert.strictEqual(-1, c1.$id);
        assert.strictEqual(-1, c2.$id);
        go.setId(3);
        go.setComponent('foo', c1);
        go.setComponent('bar', c2);
        assert.strictEqual(3, go.id);
        assert.strictEqual(3, c1.$id);
        assert.strictEqual(3, c2.$id);
    });
    
    it("should set and filter up modified", function() {
        var parent = new j.GameObject();
        var child = new j.GameObject();
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
        var child2 = new j.GameObject();
        parent.addChild(child2);
        assert.isTrue(parent.modified);
        assert.isTrue(child2.modified);
        assert.isFalse(child.modified);
    });
    
    it("should set and cascade enabled", function() {
        var parent = new j.GameObject();
        var child1 = new j.GameObject();
        var child2 = new j.GameObject();
        
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
        var c1 = new j.GameObjectComponent();
        c1.$on('update', function() {});
        var c2 = new j.GameObjectComponent();
        c2.$on('update', function() {});
        
        var parent = new j.GameObject();
        var child1 = new j.GameObject();
        var child2 = new j.GameObject();
        
        parent.setComponent('foo', c1);
        parent.setComponent('bar', c2);
        
        //test parent alone
        assert.isTrue(parent.modified);
        assert.strictEqual(2, parent.getCallbacks('update').length);
        assert.strictEqual(2, parent.getCallbacks('update', true).length);
        assert.isFalse(parent.modified);
        
        //now setup children and do the same assertions
        child1.setComponent('foo', c1);
        child1.setComponent('bar', c2);
        child2.setComponent('foo', c1);
        child2.setComponent('bar', c2);
        assert.strictEqual(2, child1.getCallbacks('update').length);
        assert.strictEqual(2, child2.getCallbacks('update').length);
        parent.addChild(child1);
        parent.addChild(child2);
        assert.isTrue(parent.modified);
        assert.isTrue(child1.modified);
        assert.isTrue(child2.modified);
        
        //did the callbacks come back from the children as well?
        assert.strictEqual(2, parent.getCallbacks('update').length);
        assert.strictEqual(6, parent.getCallbacks('update', true).length);
        assert.isFalse(parent.modified);
        assert.isFalse(child1.modified);
        assert.isFalse(child2.modified);
        
        //test actual getCallback method
        var cbs;
        cbs = parent.getCallbacks('update');
        assert.strictEqual(2, cbs.length);
        for (var i in cbs) {
            assert.isFunction(cbs[i]);
        }
        cbs = parent.getCallbacks('update', true);
        assert.strictEqual(6, cbs.length);
        for (i in cbs) {
            assert.isFunction(cbs[i]);
        }
        cbs = parent.getCallbacks('fooooooo');
        assert.strictEqual(0, cbs.length);
        cbs = parent.getCallbacks('fooooooo', true);
        assert.strictEqual(0, cbs.length);
    });

    it("should export prefab structure of self", function () {
        var parent = new j.GameObject();
        var child1 = new j.GameObject();
        var child2 = new j.GameObject();
        parent.name = 'parent';
        child1.name = 'child1';
        child2.name = 'child2';
        
        var c1 = new j.GameObjectComponent();
        c1.foo = 'bar';
        var c2 = new j.GameObjectComponent();
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
        assert.deepEqual(expected, parent.export());
    });

    it("should get all components in children by type", function() {
        var p = new j.GameObject();
        var c1 = new j.GameObject();
        var c2 = new j.GameObject();
        var c3 = new j.GameObject();
        p.addChild(c1);
        p.addChild(c2);
        c2.addChild(c3);
        c1.setComponent('foo', new j.GameObjectComponent());
        c3.setComponent('foo', new j.GameObjectComponent());
        
        assert.deepEqual(p.getComponentsInChildren('bar'), []);
        assert.strictEqual(p.getComponentsInChildren('foo').length, 2);
    });

    it("should properly mark the root object in a parent/child hierarchy", function() {
        var p = new j.GameObject();
        var c1 = new j.GameObject();
        var c2 = new j.GameObject();
        var c3 = new j.GameObject();
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
        var go = new j.GameObject();
        
        assert.isFalse(go.hasTag('foo'));
        assert.isFalse(go.hasTag('bar'));
        go.addTag('foo');
        assert.isTrue(go.hasTag('foo'));
        assert.isFalse(go.hasTag('bar'));
        go.addTag('bar');
        assert.isTrue(go.hasTag('foo'));
        assert.isTrue(go.hasTag('bar'));
        assert.deepEqual(go.getTags(), ['foo','bar']);
        go.removeTag('foo');
        assert.isFalse(go.hasTag('foo'));
        assert.isTrue(go.hasTag('bar'));
        go.removeTag('bar');
        assert.isFalse(go.hasTag('foo'));
        assert.isFalse(go.hasTag('bar'));
    });
    
    it("should allow retrieving children by tag", function() {
        var parent = new j.GameObject();
        var c1 = new j.GameObject();
        var c2 = new j.GameObject();
        var c3 = new j.GameObject();
        var c4 = new j.GameObject();
        
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
        var parent = new j.GameObject();
        var child = new j.GameObject();
        var child2 = new j.GameObject();
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
        var parent = new j.GameObject();
        var child = new j.GameObject();
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
