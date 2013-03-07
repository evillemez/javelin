'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;
var j = require('../build/javelin.js');
var f = require('./fixtures/fixtures.js');

describe("Javelin Engine", function() {
    
    //for convenience
    var getEngine = function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), f.GameConfig);
        e.initialize();
        return e;
    };
    
    var getEmptyEngine = function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        e.initialize();
        return e;
    };
    
    beforeEach(function() {
        j.reset();
    });
    
    it("should instantiate with game configuration and environment", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), f.GameConfig);
    });
    
    it("should automatically register game plugins, prefabs, scenes and components upon initialize", function() {
        assert.isFalse(j.getComponentHandler('f.foo'));
        assert.isFalse(j.getPluginHandler('f.test_plugin'));
        assert.isFalse(j.getPrefab('f.testPrefab'));
        assert.isFalse(j.getScene('f.scene1'));
        var e = getEngine();
        assert.isFunction(j.getComponentHandler('f.foo'));
        assert.isFunction(j.getPluginHandler('f.test_plugin'));
        assert.isObject(j.getPrefab('f.testPrefab'));
        assert.isObject(j.getScene('f.scene1'));
    });
    
    it("should step with no components and or objects", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        assert.equal(0, e.stepId);
        e.step();
        assert.equal(1, e.stepId);
    });
    
    it("should properly load and unload plugins", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        assert.isFalse(e.getPlugin('f.test_plugin'));
        
        e = getEngine();
        e.loadPlugin('f.test_plugin');
        var p = e.getPlugin('f.test_plugin');
        assert.isTrue(p instanceof j.EnginePlugin);
        assert.isTrue(p.$engine instanceof j.Engine);
        e.unloadPlugin('f.test_plugin');
        assert.isFalse(e.getPlugin('f.test_plugin'));
        
        e.loadPlugin('f.test_plugin');
        p = e.getPlugin('f.test_plugin');
        assert.isTrue(p instanceof j.EnginePlugin);
        e.unloadPlugins();
        assert.isFalse(e.getPlugin('f.test_plugin'));
    });
    
    it("should properly call plugins on step", function() {
        var e = getEngine();
        e.loadPlugin('f.test_plugin');
        var p = e.getPlugin('f.test_plugin');
        assert.equal(0, p.stepCount);
        e.step();
        assert.equal(1, p.stepCount);
    });
    
    it("should instantiate and destroy game objects", function() {
        //regular instantiate
        var e = getEngine();
        assert.equal(0, e.gos.length);
        var go = e.instantiate('f.testPrefab');
        assert.equal(1, e.gos.length);
        assert.equal(1, go.id);
        e.destroy(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);
        
        //prefab
        
        //object
    });
    
    it("should notify plugins on game object create and destroy", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
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
        j.registerComponent(f.Component.FooComponent);
        j.initialize();
        
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        var go = e.__addGameObject(new j.GameObject());
        go.addComponent(f.Component.FooComponent);
        assert.equal(0, go.getComponent('f.foo').numUpdates);
        e.step();
        assert.equal(1, go.getComponent('f.foo').numUpdates);
    });
    
    it("should call game object on create and destroy", function() {
        j.registerComponent(f.Component.FooComponent);
        j.initialize();
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        var go = new j.GameObject();
        var comp = go.addComponent(f.Component.FooComponent);
        assert.isFalse(comp.started);
        assert.isFalse(comp.destroyed);
        
        e.__addGameObject(go);
        assert.isTrue(comp.started);
        e.__destroyGameObject(go);
        assert.isTrue(comp.destroyed);
    });
    
    it("should properly call callback upon loading a scene", function() {
        j.registerComponent(f.Component.FooComponent);
        j.registerComponent(f.Component.BarComponent);
        j.registerComponent(f.BazComponent);
        j.registerComponent(f.QuxComponent);
        j.initialize();
        
        var called = false;
        var cb = function() {
            called = true;
        };
        
        assert.isFalse(called);
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        e.loadScene(f.Scene1, cb);
        assert.isTrue(called);
    });
    
    it("should properly instantiate game objects from prefab definitions", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        j.registerComponent(j.Component.Transform2d);
        j.registerComponent(j.Component.Sprite);
        j.initialize();
        
        var go = e.instantiateObject(f.Prefab1);
        assert.isTrue(go instanceof j.GameObject);
        assert.isTrue(go.getComponent('transform2d') instanceof j.GameObjectComponent);
        assert.isTrue(go.getComponent('sprite') instanceof j.GameObjectComponent);
    });
    
    it("should properly instantiate and destroy game objects during update step", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        j.registerComponent(f.Component.FooComponent);
        j.registerComponent(f.Component.BarComponent);
        j.registerComponent(f.BazComponent);
        j.registerComponent(f.QuxComponent);
        j.registerComponent(f.ManagerComponent);
        j.initialize();
        assert.equal(0, e.gos.length);
        e.instantiateObject(f.Prefab2);
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
    
    it("should instantiate prefabs when requested as a string", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), {});
        j.registerPrefab(f.Prefab1);
        j.initialize();
        var go = e.instantiate('Test Object');
        assert.isTrue(go instanceof j.GameObject);
        assert.isTrue(go.getComponent('transform2d') instanceof j.GameObjectComponent);
    });
    
    it("should load a scene when requested as a string");
    
    it("should instantiate necessary plugins upon loading initial config", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), f.GameConfig);
        assert.isFalse(e.getPlugin('canvas2d'));
        e.initialize();
        assert.isTrue(e.getPlugin('canvas2d') instanceof j.EnginePlugin);
    });
    
    it("should automatically register scenes, prefabs, components and plugins from config upon initialization", function() {
        var e = new j.Engine(new f.Env.TestEnvironment(), f.GameConfig);
        assert.isFalse(j.getPluginHandler('f.test_plugin'));
        e.initialize();
        assert.isFunction(j.getPluginHandler('f.test_plugin'));
    });
    
    it("should properly create and add components to game objects");
        
    it("should properly initialize plugins upon loading a scene");
    
    it("should instantiate add game objects defined in a scene");
});
