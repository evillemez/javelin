'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Javelin Registry", function() {
    
    var javelin, f;
    
    beforeEach(function() {
        j = require('../build/javelin.js');
        f = require('./fixtures/fixtures.js');
        javelin.reset();
    });
    
    it("should detect string literals", function() {
        var a = 'foo';
        var b = '34';
        var c = 34;
        
        assert.isTrue(javelin.isString(a));
        assert.isTrue(javelin.isString(b));
        assert.isFalse(javelin.isString(c));
    });
    
    it("should detect empty object and array literals", function() {
        var a = [];
        var b = {};
        var c = [1];
        var d = {foo: null};
        
        assert.isTrue(javelin.isEmpty(a));
        assert.isTrue(javelin.isEmpty(b));
        assert.isFalse(javelin.isEmpty(c));
        assert.isFalse(javelin.isEmpty(d));
    });

    it("should determine if a value is an array literal", function() {
        assert.isFalse(javelin.isArray(5));
        assert.isFalse(javelin.isArray('foo'));
        assert.isFalse(javelin.isArray({foo: 'bar'}));
        assert.isTrue(javelin.isArray([]));
        assert.isTrue(javelin.isArray([5, 'foo']));        
    });
    
    it("should determine if a value is a function", function() {
        assert.isFalse(javelin.isFunction(5));
        assert.isFalse(javelin.isFunction('foo'));
        assert.isFalse(javelin.isFunction([5]));
        assert.isFalse(javelin.isFunction({foo: 'bar'}));
        assert.isTrue(javelin.isFunction(function() {}));
    });
    
    it("should determine if a value is an object", function() {
        assert.isFalse(javelin.isObject(5));
        assert.isFalse(javelin.isObject('foo'));
        assert.isFalse(javelin.isObject([5]));
        assert.isTrue(javelin.isObject({}));
    });

    it("should not allow registering invalid components", function() {
        //non-function
        assert.throws(function() {
            javelin.registerComponent(5);
        }, /must be functions/);
        assert.throws(function() {
            javelin.registerComponent('foo');
        }, /must be functions/);
        assert.throws(function() {
            javelin.registerComponent({foo: 'bar'});
        }, /must be functions/);
        
        
        //test for missing alias
        var FooComp = function() {};
        assert.throws(function() {
            javelin.registerComponent(FooComp);
        }, /specify their alias/);
        
        //test for proper requires array
        FooComp.alias = 'fooComponent';
        FooComp.requires = 5;
        assert.throws(function() {
            javelin.registerComponent(FooComp);
        }, /be an array/);
        FooComp.requires = 'f.foo';
        assert.throws(function() {
            javelin.registerComponent(FooComp);
        }, /be an array/);
        
        //test for proper inherits
        var BarComp = function() {};
        BarComp.alias = 'barComponent';
        BarComp.inherits = 34;
        assert.throws(function() {
            javelin.registerComponent(BarComp);
        }, /component alias string/);
        BarComp.inherits = ['foo','bar'];
        assert.throws(function() {
            javelin.registerComponent(BarComp);
        }, /component alias string/);
        
        //can't inherit and require the same thing
        var BazComp = function() {};
        BazComp.alias = 'bazComponent';
        BazComp.inherits = 'foo';
        BazComp.requires = ['foo'];
        assert.throws(function() {
            javelin.registerComponent(BazComp);
        }, /cannot both require and inherit/);
    });
    
    it("should register scenes", function() {
        assert.isFalse(javelin.getScene('f.scene1'));
        javelin.registerScene(f.Scene.Scene1);
        assert.isObject(javelin.getScene('f.scene1'));
    });
    
    it("should register prefabs", function() {
        assert.isFalse(javelin.getPrefab('f.testPrefab'));
        javelin.registerPrefab(f.Prefab.Prefab1);
        assert.isObject(javelin.getPrefab('f.testPrefab'));
    });
    
    it("should register components", function() {
        assert.isFalse(javelin.getComponentHandler('f.foo'));
        javelin.registerComponent(f.Component.FooComponent);
        assert.isFunction(javelin.getComponentHandler('f.foo'));
    });
    
    it("should register plugins", function() {
        assert.isFalse(javelin.getPluginHandler('f.test_plugin'));
        javelin.registerPlugin(f.Plugin.TestPlugin);
        assert.isFunction(javelin.getPluginHandler('f.test_plugin'));
    });
    
    it("should properly assemble component requirements on initialize()", function() {
        javelin.registerComponent(f.Component.Blar);
        javelin.registerComponent(f.Component.Blag);
        javelin.registerComponent(f.Component.Blaz);
        javelin.registerComponent(f.Component.Blav);
        javelin.initialize();
        
        var expectedBlar = [];
        var expectedBlag = [];
        
        var expectedBlaz = [
            f.Component.Blar,
            f.Component.Blag
        ];
        
        var expectedBlav = [
            f.Component.Blar,
            f.Component.Blag,
            f.Component.Blaz,
        ];
        
        assert.deepEqual(expectedBlar, javelin.getComponentRequirements('f.blar'));
        assert.deepEqual(expectedBlag, javelin.getComponentRequirements('f.blag'));
        assert.deepEqual(expectedBlaz, javelin.getComponentRequirements('f.blaz'));
        assert.deepEqual(expectedBlav, javelin.getComponentRequirements('f.blav'));
    });

    it("should register Javelin objects upon intialize()", function() {
        assert.isFalse(javelin.getPluginHandler('canvas2d'));
        assert.isFalse(javelin.getComponentHandler('transform2d'));
        javelin.initialize();
        assert.isFunction(javelin.getPluginHandler('canvas2d'));
        assert.isFunction(javelin.getComponentHandler('transform2d'));
        
        javelin.reset();

        javelin.AUTO_REGISTER_SELF = false;
        assert.isFalse(javelin.getPluginHandler('canvas2d'));
        assert.isFalse(javelin.getComponentHandler('transform2d'));
        javelin.initialize();
        assert.isFalse(javelin.getPluginHandler('canvas2d'));
        assert.isFalse(javelin.getComponentHandler('transform2d'));
    });
    
    it("should properly unpack prefab definitions upon initialize()", function() {

        //this is a bit of a hack to force node.js to re-require the original file
        //which should include prefabs that reference other prefabs as strings,
        //if I don't this, the test fails when run with other tests because the
        //included fixture prefabs get modified directly
        var name = require.resolve('./fixtures/fixtures.js');
        delete require.cache[name];

        var f = require('./fixtures/fixtures.js');
        javelin.registerPrefab(f.Prefab.Prefab1);
        javelin.registerPrefab(f.Prefab.Prefab2);
        javelin.registerPrefab(f.Prefab.Prefab3);

        assert.isString(f.Prefab.Prefab3.children[0]);
        assert.isUndefined(f.Prefab.Prefab3.children[0].name);

        javelin.initialize();
        
        var prefab = javelin.getPrefab('f.nestedPrefab');
        assert.isObject(prefab);
        assert.strictEqual('f.testPrefab', prefab.children[0].name);
    });
});
