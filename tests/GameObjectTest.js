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
            components: {},
            children: [
                {
                    name: 'child1',
                    components: {
                        'bar': {
                            foo: 'bar'
                        }
                    }
                },
                {
                    name: 'child2',
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

    it.skip("should get all components in children by type", function() {
        
    });

    it.skip("should properly mark the root object in a parent/child hierarchy", function() {
        //test parent.getRoot() and child.getRoot(), and general obj.root
    });

    it.skip("should manage tags, and allow retrieving children by tag", function() {
        //go.hasTag(), go.addTag(), go.removeTag(), go.getChildrenByTag(tag, recursive)
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
