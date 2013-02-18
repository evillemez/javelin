'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');
var f = require('./fixtures/fixtures.js');

j.register(f.FooComponent);
j.register(f.BarComponent);
j.register(f.BazComponent);
j.register(f.QuxComponent);
j.initialize();

describe("GameObject", function() {
    it("should instantiate properly", function() {
        var go = new j.GameObject();
        assert.equal(true, go instanceof j.GameObject);
    });
    
    it("should add components properly", function() {
        var go = new j.GameObject();
        assert.equal(false, go.hasComponent('f.foo'));
        assert.equal(false, go.getComponent('f.foo'));
        go.addComponent(f.FooComponent);
        assert.equal(true, go.hasComponent('f.foo'));
        var comp = go.getComponent('f.foo');
        assert.equal(true, comp instanceof j.GameObjectComponent);
        assert.equal(true, comp.$isA('f.foo'));
    });
    
    
});
