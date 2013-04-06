'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Javelin Engine", function() {
    
    var j, f;
    
    beforeEach(function() {
        j = require('../build/javelin.js');
        f = require('./fixtures/fixtures.js');
        j.reset();
    });

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
        var e = getEngine();
        assert.isFalse(e.getPlugin('f.test_plugin'));
        
        e = getEngine();
        e.loadPlugin('f.test_plugin');
        var p = e.getPlugin('f.test_plugin');
        assert.isTrue(p instanceof j.EnginePlugin);
        assert.isTrue(p.$engine instanceof j.Engine);
        e.unloadPlugin('f.test_plugin');
        assert.isFalse(e.getPlugin('f.test_plugin'));
                
        //config inherited from game config
        e.loadPlugin('f.test_plugin');
        p = e.getPlugin('f.test_plugin');
        assert.isTrue(p instanceof j.EnginePlugin);
        assert.strictEqual('override', p.config.foo);
        e.unloadPlugins();
        assert.isFalse(e.getPlugin('f.test_plugin'));
        
        //load w/ config
        e.loadPlugin('f.test_plugin', {
            foo: 'I have a milkshake.'
        });
        p = e.getPlugin('f.test_plugin');
        assert.strictEqual('I have a milkshake.', p.config.foo);
        e.unloadPlugin();
    });
    
    it("should properly call plugins on step", function() {
        var e = getEngine();
        e.loadPlugin('f.test_plugin');
        var p = e.getPlugin('f.test_plugin');
        assert.equal(0, p.stepCount);
        e.step();
        assert.equal(1, p.stepCount);
    });
    
    it("should properly add game object components to game objects", function() {
        var e = getEngine();
        var go;
        
        //basic inheritence
        go = new j.GameObject();
        assert.isFalse(go.hasComponent('f.foo'));
        assert.isFalse(go.hasComponent('f.bar'));
        assert.isFalse(go.hasComponent('f.baz'));
        e.addComponentToGameObject(go, 'f.baz');
        assert.isTrue(go.hasComponent('f.foo'));
        assert.isTrue(go.hasComponent('f.bar'));
        assert.isTrue(go.hasComponent('f.baz'));
        assert.deepEqual(go.getComponent('f.foo'), go.getComponent('f.bar'));
        assert.deepEqual(go.getComponent('f.foo'), go.getComponent('f.baz'));
        assert.deepEqual(go.getComponent('f.bar'), go.getComponent('f.baz'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.bar'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.baz'));
        assert.isTrue(go.getComponent('f.bar').$instanceOf('f.bar'));
        assert.isTrue(go.getComponent('f.bar').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.foo').$instanceOf('f.foo'));

        //basic requirements
        go = new j.GameObject();
        assert.isFalse(go.hasComponent('f.blar'));
        assert.isFalse(go.hasComponent('f.blag'));
        assert.isFalse(go.hasComponent('f.blaz'));
        e.addComponentToGameObject(go, 'f.blaz');
        assert.isTrue(go.hasComponent('f.blar'));
        assert.isTrue(go.hasComponent('f.blag'));
        assert.isTrue(go.hasComponent('f.blaz'));
        
        //complex add - inherits from components that require other components, which inherit from others
        go = new j.GameObject();
        assert.isFalse(go.hasComponent('f.foo'));
        assert.isFalse(go.hasComponent('f.bar'));
        assert.isFalse(go.hasComponent('f.baz'));
        assert.isFalse(go.hasComponent('f.blar'));
        assert.isFalse(go.hasComponent('f.blag'));
        assert.isFalse(go.hasComponent('f.blaz'));
        assert.isFalse(go.hasComponent('f.quip'));
        assert.isFalse(go.hasComponent('f.shqip'));
        e.addComponentToGameObject(go, 'f.shqip');
        assert.isTrue(go.hasComponent('f.foo'));
        assert.isTrue(go.hasComponent('f.bar'));
        assert.isTrue(go.hasComponent('f.baz'));
        assert.isTrue(go.hasComponent('f.blar'));
        assert.isTrue(go.hasComponent('f.blag'));
        assert.isTrue(go.hasComponent('f.blaz'));
        assert.isTrue(go.hasComponent('f.quip'));
        assert.isTrue(go.hasComponent('f.shqip'));
        assert.deepEqual(go.getComponent('f.foo'), go.getComponent('f.bar'));
        assert.deepEqual(go.getComponent('f.foo'), go.getComponent('f.baz'));
        assert.deepEqual(go.getComponent('f.bar'), go.getComponent('f.baz'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.bar'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.baz'));
        assert.isTrue(go.getComponent('f.bar').$instanceOf('f.bar'));
        assert.isTrue(go.getComponent('f.bar').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.foo').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.quip').$instanceOf('f.blav'));
        assert.deepEqual(go.getComponent('f.quip'), go.getComponent('f.blav'));
    });
    
    it("should instantiate objects with proper components", function() {
        //TODO: similar test as above, but configuring multiple components
        var e = getEngine();
        var obj = {
            name: 'test',
            components: {
                'f.bar': {
                    foo: 'blip',
                },
                'f.blar': {
                    bar: 'bling'
                },
                'f.shqip': {},
                'f.blav': {
                    baz: 'turtles'
                }
            }
        };
        
        var go = e.instantiateObject(obj);
        
        //assert all the things...  ALL OF THEM!
        
        assert.isTrue(go.hasComponent('f.foo'));
        assert.isTrue(go.hasComponent('f.bar'));
        assert.isTrue(go.hasComponent('f.baz'));
        assert.isTrue(go.hasComponent('f.blar'));
        assert.isTrue(go.hasComponent('f.blag'));
        assert.isTrue(go.hasComponent('f.blaz'));
        assert.isTrue(go.hasComponent('f.quip'));
        assert.isTrue(go.hasComponent('f.shqip'));
        assert.deepEqual(go.getComponent('f.foo'), go.getComponent('f.bar'));
        assert.deepEqual(go.getComponent('f.foo'), go.getComponent('f.baz'));
        assert.deepEqual(go.getComponent('f.bar'), go.getComponent('f.baz'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.bar'));
        assert.isTrue(go.getComponent('f.baz').$instanceOf('f.baz'));
        assert.isTrue(go.getComponent('f.bar').$instanceOf('f.bar'));
        assert.isTrue(go.getComponent('f.bar').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.foo').$instanceOf('f.foo'));
        assert.isTrue(go.getComponent('f.quip').$instanceOf('f.blav'));
        assert.deepEqual(go.getComponent('f.quip'), go.getComponent('f.blav'));
        assert.strictEqual('blip', go.getComponent('f.foo').foo);
        assert.strictEqual('blip', go.getComponent('f.bar').foo);
        assert.strictEqual('blip', go.getComponent('f.baz').foo);
        assert.strictEqual(1, go.getCallbacks('engine.update').length);
        assert.strictEqual('baz', go.getComponent('f.foo').test());
        
        //NOTE: even though the object has 'f.baz', when it exports it will
        //export under the alias of 'f.bar', because it was added first, and
        //shouldn't be overwritten ... see comments in `GameObject.setComponent`
        
    });

    it("should instantiate and destroy game objects", function() {
        var go;
        var obj = {
            name: "example",
            components: {
                'f.foo': {}
            }
        };        

        var e = getEngine();
        
        //instantiate prefab
        assert.equal(0, e.gos.length);
        go = e.instantiatePrefab('f.testPrefab');
        assert.equal(1, e.gos.length);
        assert.isTrue(go.hasComponent('sprite'));
        assert.isTrue(go.hasComponent('transform2d'));
        assert.equal(1, go.id);
        e.destroy(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);

        //instantiate object
        go = e.instantiate(obj);
        assert.equal(1, e.gos.length);
        assert.equal(2, go.id);
        assert.isTrue(go.hasComponent('f.foo'));
        e.destroy(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);

        //regular instantiate, using both prefab reference
        //and object
        assert.equal(0, e.gos.length);
        go = e.instantiate('f.testPrefab');
        assert.equal(1, e.gos.length);
        assert.equal(3, go.id);
        assert.isTrue(go.hasComponent('sprite'));
        assert.isTrue(go.hasComponent('transform2d'));
        e.destroy(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);
        
        go = e.instantiate(obj);
        assert.equal(1, e.gos.length);
        assert.equal(4, go.id);
        assert.isTrue(go.hasComponent('f.foo'));
        e.destroy(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);
    });
    
    it("should instantiate and destroy nested objects", function() {
        var e = getEngine();
        assert.strictEqual(e.gos.length, 0);
        var go = e.instantiatePrefab('f.nestedPrefab');
        assert.strictEqual(e.gos.length, 3);
        assert.strictEqual(e.lastGoId, 3);
        
        
        assert.isTrue(go.hasChildren());
        assert.strictEqual(go.id, 1);
        assert.strictEqual(go.children.length, 2);

        assert.strictEqual(go.children[0].id, 2);
        assert.isTrue(go.children[0].hasParent());
        assert.isTrue(go.children[0].hasComponent('transform2d'));
        assert.strictEqual(go.children[1].id, 3);
        assert.isTrue(go.children[1].hasParent());
        assert.isTrue(go.children[1].hasComponent('f.foo'));
        
        e.destroy(go);
        assert.strictEqual(e.gos.length, 0);
    });
    
    it("should retrieve objects by id", function() {
        var e = getEngine();
        e.instantiate('f.testPrefab');
        e.instantiate('f.managerPrefab');
        
        var go = e.getGameObjectById(2);
        assert.isTrue(go.hasComponent('f.manager'));
        
        go = e.getGameObjectById(1);
        assert.isTrue(go.hasComponent('sprite'));
        assert.isTrue(go.hasComponent('transform2d'));
    });
    
    it("should load and unload scenes", function() {
        var e = getEngine();
        assert.isFalse(e.getCurrentScene());
        e.loadScene('f.scene1');
        assert.strictEqual('f.scene1', e.getCurrentScene());
        e.unloadScene();
        assert.isFalse(e.getCurrentScene());
    });
    
    it("should initialize plugins upon loading scenes", function() {
        var e = getEngine();
        assert.isFalse(e.getPlugin('f.test_plugin'));
        e.loadScene('f.scene1');
        var p = e.getPlugin('f.test_plugin');
        assert.isTrue(p instanceof j.EnginePlugin);
        assert.isTrue(p.initialized);
        assert.strictEqual('baz', p.config.foo);
    });
    
    it("should instantiate game objects defined in a scene", function() {
        var e = getEngine();
        assert.strictEqual(e.gos.length, 0);
        e.loadScene('f.scene1');
        assert.strictEqual(e.gos.length, 3);
    });

    it("should call a callback upon loading a scene", function(done) {
        var e = getEngine();
        var called = false;

        var testCalled = function() {
            assert.isTrue(called);
            assert.strictEqual(e.getCurrentScene(), 'f.scene1');
            done();
        };

        var sceneCallback = function() {
            called = true;
            testCalled();
        };
        
        
        assert.isFalse(called);
        assert.isFalse(e.getCurrentScene());
        e.loadScene('f.scene1', sceneCallback);
    });
    
    it("should notify plugins on game object create and destroy", function() {
        var e = getEngine();
        e.loadPlugin('f.test_plugin');
        var p = e.getPlugin('f.test_plugin');
        assert.strictEqual(0, p.goCount);
        
        //test one
        var go = e.instantiate('f.testPrefab');
        assert.strictEqual(1, p.goCount);
        
        //test nested
        var nested = e.instantiate('f.nestedPrefab');
        assert.strictEqual(4, p.goCount);
        
        e.destroy(go);
        assert.strictEqual(3, p.goCount);
        
        e.destroy(nested);
        assert.strictEqual(0, p.goCount);
    });
    
    it.skip("should notify plugins on prefab instantiate and destroy", function() {
        //TODO
    });
    
    it("should call game object on update", function() {
            
        var e = getEngine();
        var go = e.instantiate('f.prefab4');
        assert.equal(0, go.getComponent('f.foo').numUpdates);
        e.step();
        assert.equal(1, go.getComponent('f.foo').numUpdates);
    });
    
    it("should call game object on create and destroy", function() {
        var e = getEngine();
        var go = e.instantiate('f.prefab4');
        var c = go.getComponent('f.blah');
        assert.isTrue(c.started);
        assert.isFalse(c.destroyed);
        e.destroy(go);
        assert.isTrue(c.destroyed);        
    });
            
    it("should properly instantiate and destroy game objects during update step", function() {
        var e = getEngine();
        assert.equal(0, e.gos.length);
        e.instantiatePrefab('f.managerPrefab');
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
    
    it("should emit events emitted by root gameObjects", function() {
        var e = getEngine();
        var parent = e.instantiateObject({});
        var child = e.instantiateObject({});
        parent.addChild(child);
        
        var data = {
            foo: true
        };
        
        child.on('some.event', function(eventData) {
            assert.isTrue(eventData.foo);
        });

        parent.on('some.event', function(eventData) {
            assert.isTrue(eventData.foo);
        });
        
        e.on('some.event', function(eventData) {
            assert.isTrue(eventData.foo);
            eventData.foo = false;
        });
        
        assert.isTrue(data.foo);
        child.emit('some.event', data);
        assert.isFalse(data.foo);
    });
    
    it("should dispatch events to root level gameObjects", function() {
        var e = getEngine();
        var parent = e.instantiateObject({});
        var child = e.instantiateObject({});
        parent.addChild(child);
        
        var data = {
            foo: true
        };
        
        parent.on('some.event', function(eventData) {
            assert.isTrue(eventData.foo);
        });

        child.on('some.event', function(eventData) {
            assert.isTrue(eventData.foo);
            eventData.foo = false;
        });

        assert.isTrue(data.foo);
        e.broadcast('some.event', data);
        assert.isFalse(data.foo);
    });
});
