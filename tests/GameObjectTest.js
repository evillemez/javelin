'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');
var f = require('./fixtures/fixtures.js');

//GOs depend on the Engine for some functionality...
describe("GameObject", function() {
    var engine;
    
    beforeEach(function() {
        j.reset();
        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);
        j.register(f.QuxComponent);
        j.register(f.ManagerComponent);
        engine = new j.Engine(new f.TestEnvironment(), {});
    });
    
    it("should instantiate properly", function() {
        var go = new j.GameObject();
        assert.equal(true, go instanceof j.GameObject);
    });
    
    //TODO: move test
    it("should add components properly", function() {
        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);
        j.register(f.QuxComponent);
        j.initialize();

        var go = new j.GameObject();
        assert.equal(false, go.hasComponent('f.foo'));
        assert.equal(false, go.getComponent('f.foo'));
        go.addComponent(f.FooComponent);
        assert.equal(true, go.hasComponent('f.foo'));
        var comp = go.getComponent('f.foo');
        assert.equal(true, comp instanceof j.GameObjectComponent);
        assert.equal(true, comp.$instanceOf('f.foo'));
        
        assert.equal(false, go.hasComponent('f.qux'));
        assert.equal(false, go.hasComponent('f.bar'));
        assert.equal(false, go.hasComponent('f.baz'));
        assert.equal(false, go.instanceOf('f.baz'));
        go.addComponent(f.QuxComponent);
        assert.equal(true, go.hasComponent('f.qux'));
        assert.equal(true, go.hasComponent('f.bar'));
        assert.equal(true, go.hasComponent('f.baz'));
        assert.equal(true, go.instanceOf('f.baz'));
        comp = go.getComponent('f.baz');
        assert.equal(true, comp.$instanceOf('f.foo'));
    });
        
    it("should serialize and unserialize properly");
    
    it("should accept child game objects");

    it("should broadcast events to children");
    
    it("should emit events to parents");
    
    it("should assemble callback cache properly");
    
    it("should set and cascade id");
    
    it("should set and filter up modified");
    
    it("should set and cascade enabled");
    
});
