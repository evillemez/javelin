'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

var j = null;

describe("Javelin Registry", function() {
    
    var j, f;
    
    beforeEach(function() {
        j = require('../build/javelin.js');
        f = require('./fixtures/fixtures.js');
        j.reset();
    });
    
    it("should detect string literals", function() {
        var a = 'foo';
        var b = '34';
        var c = 34;
        
        assert.isTrue(j.isString(a));
        assert.isTrue(j.isString(b));
        assert.isFalse(j.isString(c));
    });
    
    it("should detect empty object and array literals", function() {
        var a = [];
        var b = {};
        var c = [1];
        var d = {foo: null};
        
        assert.isTrue(j.isEmpty(a));
        assert.isTrue(j.isEmpty(b));
        assert.isFalse(j.isEmpty(c));
        assert.isFalse(j.isEmpty(d));
    });
    
    it("should register scenes", function() {
        assert.isFalse(j.getScene('f.scene1'));
        j.registerScene(f.Scene.Scene1);
        assert.isObject(j.getScene('f.scene1'));
    });
    
    it("should register prefabs", function() {
        assert.isFalse(j.getPrefab('f.testPrefab'));
        j.registerPrefab(f.Prefab.Prefab1);
        assert.isObject(j.getPrefab('f.testPrefab'));
    });
    
    it("should register component handlers", function() {
        assert.isFalse(j.getComponentHandler('f.foo'));
        j.registerComponent(f.Component.FooComponent);
        assert.isFunction(j.getComponentHandler('f.foo'));
    });
    
    it("should register plugin handlers", function() {
        assert.isFalse(j.getPluginHandler('f.test_plugin'));
        j.registerPlugin(f.Plugin.TestPlugin);
        assert.isFunction(j.getPluginHandler('f.test_plugin'));
    });

    it.skip("should properly assemble component chain on initialize()", function() {
        j.registerComponent(f.Component.FooComponent);
        j.registerComponent(f.Component.BarComponent);
        j.registerComponent(f.Component.BazComponent);
        j.registerComponent(f.Component.QuxComponent);
        j.initialize();
        
        var expectedFoo = [
            f.Component.FooComponent
        ];

        var expectedBar = [
            f.Component.FooComponent,
            f.Component.BarComponent
        ];
        
        var expectedBaz = [
            f.Component.FooComponent,
            f.Component.BarComponent,
            f.Component.BazComponent
        ];
        
        var expectedQux = [
            f.Component.QuxComponent,
        ];
        
        assert.deepEqual(expectedFoo, j.getComponentChain('f.foo'));
        assert.deepEqual(expectedBar, j.getComponentChain('f.bar'));
        assert.deepEqual(expectedBaz, j.getComponentChain('f.baz'));
        assert.deepEqual(expectedQux, j.getComponentChain('f.qux'));
    });
    
    it.skip("should properly assemble component requirements on initialize()", function() {
        j.registerComponent(f.Component.FooComponent);
        j.registerComponent(f.Component.BarComponent);
        j.registerComponent(f.Component.BazComponent);        
        j.registerComponent(f.Component.QuxComponent);
        j.initialize();
        
        var expectedFoo = [];
        
        var expectedBar = [
            f.Component.FooComponent
        ];
        
        var expectedBaz = [
            f.Component.FooComponent,
            f.Component.BarComponent
        ];
        
        var expectedQux = [
            f.Component.FooComponent,
            f.Component.BarComponent,
            f.Component.BazComponent
        ];
        
        assert.deepEqual(expectedFoo, j.getComponentRequirements('f.foo'));
        assert.deepEqual(expectedBar, j.getComponentRequirements('f.bar'));
        assert.deepEqual(expectedBaz, j.getComponentRequirements('f.baz'));
        assert.deepEqual(expectedQux, j.getComponentRequirements('f.qux'));
    });

    it("should register Javelin objects upon intialize()", function() {
        assert.isFalse(j.getPluginHandler('canvas2d'));
        assert.isFalse(j.getComponentHandler('transform2d'));
        j.initialize();
        assert.isFunction(j.getPluginHandler('canvas2d'));
        assert.isFunction(j.getComponentHandler('transform2d'));
        
        j.reset();

        j.AUTO_REGISTER_SELF = false;
        assert.isFalse(j.getPluginHandler('canvas2d'));
        assert.isFalse(j.getComponentHandler('transform2d'));
        j.initialize();
        assert.isFalse(j.getPluginHandler('canvas2d'));
        assert.isFalse(j.getComponentHandler('transform2d'));
    });
    
    it("should properly unpack prefab definitions upon initialize()", function() {
        //this is a bit of a hack to force node.js to re-require the original file
        //which should include prefabs that reference other prefabs as strings
        var name = require.resolve('./fixtures/fixtures.js');
        delete require.cache[name];

        var f = require('./fixtures/fixtures.js');
        j.registerPrefab(f.Prefab.Prefab1);
        j.registerPrefab(f.Prefab.Prefab2);
        j.registerPrefab(f.Prefab.Prefab3);

        assert.isString(f.Prefab.Prefab3.children[0]);
        assert.isUndefined(f.Prefab.Prefab3.children[0].name);

        j.initialize();
        
        var prefab = j.getPrefab('f.nestedPrefab');
        assert.isObject(prefab);
        assert.strictEqual('f.testPrefab', prefab.children[0].name);
    });
});
