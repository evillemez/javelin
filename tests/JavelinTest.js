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

    it("should determine if a value is an array literal", function() {
        assert.isFalse(j.isArray(5));
        assert.isFalse(j.isArray('foo'));
        assert.isFalse(j.isArray({foo: 'bar'}));
        assert.isTrue(j.isArray([]));
        assert.isTrue(j.isArray([5, 'foo']));        
    });
    
    it("should determine if a value is a function", function() {
        assert.isFalse(j.isFunction(5));
        assert.isFalse(j.isFunction('foo'));
        assert.isFalse(j.isFunction([5]));
        assert.isFalse(j.isFunction({foo: 'bar'}));
        assert.isTrue(j.isFunction(function() {}));
    });
    
    it("should determine if a value is an object", function() {
        assert.isFalse(j.isObject(5));
        assert.isFalse(j.isObject('foo'));
        assert.isFalse(j.isObject([5]));
        assert.isTrue(j.isObject({}));
    });

    it("should not allow registering invalid components", function() {
        //non-function
        assert.throws(function() {
            j.registerComponent(5);
        }, /must be functions/);
        assert.throws(function() {
            j.registerComponent('foo');
        }, /must be functions/);
        assert.throws(function() {
            j.registerComponent({foo: 'bar'});
        }, /must be functions/);
        
        
        //test for missing alias
        var FooComp = function() {};
        assert.throws(function() {
            j.registerComponent(FooComp);
        }, /specify their alias/);
        
        //test for proper requires array
        FooComp.alias = 'fooComponent';
        FooComp.requires = 5;
        assert.throws(function() {
            j.registerComponent(FooComp);
        }, /be an array/);
        FooComp.requires = 'f.foo';
        assert.throws(function() {
            j.registerComponent(FooComp);
        }, /be an array/);
        
        //test for proper inherits
        var BarComp = function() {};
        BarComp.alias = 'barComponent';
        BarComp.inherits = 34;
        assert.throws(function() {
            j.registerComponent(BarComp);
        }, /component alias string/);
        BarComp.inherits = ['foo','bar'];
        assert.throws(function() {
            j.registerComponent(BarComp);
        }, /component alias string/);
        
        //can't inherit and require the same thing
        var BazComp = function() {};
        BazComp.alias = 'bazComponent';
        BazComp.inherits = 'foo';
        BazComp.requires = ['foo'];
        assert.throws(function() {
            j.registerComponent(BazComp);
        }, /cannot both require and inherit/);
    });
    
    it("should not allow registering invalid prefabs", function() {
        //object literals only
        assert.throws(function() {
            j.registerPrefab(5);
        }, /must be object literals/);
        assert.throws(function() {
            j.registerPrefab('foo');
        }, /must be object literals/);
        assert.throws(function() {
            j.registerPrefab([5]);
        }, /must be object literals/);
        
        //must define a name
        assert.throws(function() {
            j.registerPrefab({});
        }, /must specify a string name/);
    });
    
    it("should not allow registering invalid plugins", function() {
        //must be functions
        assert.throws(function() {
            j.registerPlugin(5);
        }, /must be functions/);
        assert.throws(function() {
            j.registerPlugin('foo');
        }, /must be functions/);
        assert.throws(function() {
            j.registerPlugin([5]);
        }, /must be functions/);
        assert.throws(function() {
            j.registerPlugin({foo: 'bar'});
        }, /must be functions/);
        
        //must specify alias
        var plugin = function() {};
        assert.throws(function() {
            j.registerPlugin(plugin);
        }, /must specify a string alias/);
        plugin.alias = 5;
        assert.throws(function() {
            j.registerPlugin(plugin);
        }, /must specify a string alias/);
        plugin.alias = ['foo'];
        assert.throws(function() {
            j.registerPlugin(plugin);
        }, /must specify a string alias/);
        plugin.alias = {};
        
    });
    
    it("should not allow registering invalid scenes", function() {
        //object literals only
        assert.throws(function() {
            j.registerScene(5);
        }, /must be object literals/);
        assert.throws(function() {
            j.registerScene('foo');
        }, /must be object literals/);
        assert.throws(function() {
            j.registerScene([5]);
        }, /must be object literals/);
        
        //must define a name
        assert.throws(function() {
            j.registerScene({});
        }, /must specify a string name/);
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
