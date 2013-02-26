'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');
var f = require('./fixtures/fixtures.js');

describe("Javelin Engine", function() {
    
    beforeEach(function() {
        j.reset();
    });
    
    it("should step with no components and or objects", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        assert.equal(0, e.stepId);
        e.step();
        assert.equal(1, e.stepId);
    });
    
    it("should properly add and remove plugins", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        e.addPlugin(f.TestPlugin);
        var p = e.getPlugin('f.test_plugin');
        assert.equal(true, p instanceof j.EnginePlugin);
        assert.equal(true, p.$engine instanceof j.Engine);
        e.removePlugin('f.test_plugin');
        assert.equal(false, e.getPlugin('f.test_plugin'));
    });
    
    it("should properly call plugins on step", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        e.addPlugin(f.TestPlugin);
        var p = e.getPlugin('f.test_plugin');
        assert.equal(0, p.stepCount);
        e.step();
        assert.equal(1, p.stepCount);
    });
    
    it("should add and remove game objects", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        var go = new j.GameObject();
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);
        e.__addGameObject(go);
        assert.equal(1, go.id);
        assert.equal(1, e.gos.length);
        e.__destroyGameObject(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);
    });
    
    it("should notify plugins on game object create and destroy", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        e.addPlugin(f.TestPlugin);
        var p = e.getPlugin('f.test_plugin');
        assert.equal(0, p.goCount);
        var go = new j.GameObject(); 
        e.__addGameObject(go);
        assert.equal(1, p.goCount);
        e.__destroyGameObject(go);
        assert.equal(0, p.goCount);
    });
    
    it("should call game object on update", function() {
        j.register(f.FooComponent);
        j.initialize();
        
        var e = new j.Engine(new f.TestEnvironment(), {});
        var go = e.__addGameObject(new j.GameObject());
        go.addComponent(f.FooComponent);
        assert.equal(0, go.getComponent('f.foo').numUpdates);
        e.step();
        assert.equal(1, go.getComponent('f.foo').numUpdates);
    });
    
    it("should call game object on create and destroy", function() {
        j.register(f.FooComponent);
        j.initialize();
        var e = new j.Engine(new f.TestEnvironment(), {});
        var go = new j.GameObject();
        var comp = go.addComponent(f.FooComponent);
        assert.equal(false, comp.started);
        assert.equal(false, comp.destroyed);
        
        e.__addGameObject(go);
        assert.equal(true, comp.started);
        e.__destroyGameObject(go);
        assert.equal(true, comp.destroyed);
    });
    
    it("should properly call callback upon loading a scene", function() {
        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);
        j.register(f.QuxComponent);
        j.initialize();
        
        var called = false;
        var cb = function() {
            called = true;
        };
        
        assert.equal(false, called);
        var e = new j.Engine(new f.TestEnvironment(), {});
        e.loadScene(f.Scene, cb);
        assert.equal(true, called);
    });
    
    it("should properly instantiate game objects from definitions", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        j.register(j.Component.Transform2d);
        j.register(j.Component.Sprite);
        j.initialize();
        
        var go = e.instantiate(f.Prefab1);
        assert.equal(true, go instanceof j.GameObject);
        assert.equal(true, go.getComponent('transform2d') instanceof j.GameObjectComponent);
        assert.equal(true, go.getComponent('sprite') instanceof j.GameObjectComponent);
    });
    
    it("should properly instantiate and destroy game objects during update step", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);
        j.register(f.QuxComponent);
        j.register(f.ManagerComponent);
        j.initialize();
        assert.equal(0, e.gos.length);
        e.instantiate(f.Prefab2);
        assert.equal(5, e.gos.length);
        e.step();
        assert.equal(4, e.gos.length);
        e.step();
        assert.equal(3, e.gos.length);
        e.step();
        assert.equal(2, e.gos.length);
        e.step();
        assert.equal(1, e.gos.length);
        e.step();
        assert.equal(0, e.gos.length);
    });
    
    it("should configure plugins upon loading a scene");
    
    it("should add game objects upon loading a scene");
});
