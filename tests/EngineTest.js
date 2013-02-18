'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');
var f = require('./fixtures/fixtures.js');

describe("Javelin Engine", function() {
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
        e.addGameObject(go);
        assert.equal(1, go.id);
        assert.equal(1, e.gos.length);
        e.removeGameObject(go);
        assert.equal(-1, go.id);
        assert.equal(0, e.gos.length);
    });
    
    it("should notify plugins on game object create and destroy", function() {
        var e = new j.Engine(new f.TestEnvironment(), {});
        e.addPlugin(f.TestPlugin);
        var p = e.getPlugin('f.test_plugin');
        assert.equal(0, p.goCount);
        var go = new j.GameObject();
        e.addGameObject(go);
        assert.equal(1, p.goCount);
        e.removeGameObject(go);
        assert.equal(0, p.goCount);
    });
    
    it("should call game object on update", function() {
        j.register(f.FooComponent);
        j.initialize();
        
        var e = new j.Engine(new f.TestEnvironment(), {});
        var go = e.addGameObject(new j.GameObject());
        go.addComponent(f.FooComponent);
        assert.equal(0, go.getComponent('f.foo').numUpdates);
        e.step();
        assert.equal(1, go.getComponent('f.foo').numUpdates);
    });
});
