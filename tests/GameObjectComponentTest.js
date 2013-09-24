'use strict';
/*
var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("GameObjectComponent", function() {
    
    var j;
    
    beforeEach(function() {
        j = require('../build/javelin.js');
        j.reset();
    });
    
    it("should return false if requested callback does not exist", function() {
        var c = new j.GameObjectComponent();
        assert.isFalse(c.$getCallback("engine.update"));
    });
    
    it("should return registered callback function if exists", function() {
        var c = new j.GameObjectComponent();

        c.$on('engine.update', function() {
            return "foo";
        });

        var cb = c.$getCallback("engine.update");
        assert.strictEqual("foo", cb());
    });
    
    it("should overwrite previously registered callback", function() {
        var c = new j.GameObjectComponent();

        c.$on('engine.update', function() {
            return "foo";
        });

        c.$on('engine.update', function() {
            return "bar";
        });
        
        var cb = c.$getCallback("engine.update");
        assert.strictEqual("bar", cb());
    });
    
    it("should serialize only non-function properties added to object", function() {
        var c = new j.GameObjectComponent();
        c.foo = "bar";
        c.bar = 23;
        c.baz = function() { return "foo"; };
        
        var expected = {
            foo: "bar",
            bar: 23
        };
        
        assert.deepEqual(expected, c.$serialize());
    });
    
    it("should set properties when data is unserialized", function() {
        var c = new j.GameObjectComponent();
        
        var data = {
            foo: "bar",
            bar: 23
        };
        
        assert.isUndefined(c.foo);
        assert.isUndefined(c.bar);
        
        c.$unserialize(data);

        assert.strictEqual("bar", c.foo);
        assert.strictEqual(23, c.bar);
        
        assert.deepEqual(data, c.$serialize());
    });
    
    it("should be scriptable from handler function and not conflict with multiple instances", function() {
        
        //an example component construction function
        var Namespace = Namespace || {};
        Namespace.FooComponent = function(comp, testWord) {            
            var foo = testWord;
            
            //all components
            comp.x = 5.0;
            
            //callback to return something "private"
            comp.$on("engine.update", function() {
                return foo;
            });
        };
        Namespace.FooComponent.alias = "namespace.foo";
        
        //create and "setup" components
        assert.equal("namespace.foo", Namespace.FooComponent.alias);
        var c1 = new j.GameObjectComponent();
        var c2 = new j.GameObjectComponent();
        Namespace.FooComponent(c1, 'bar');
        Namespace.FooComponent(c2, 'baz');
        var cb1 = c1.$getCallback("engine.update");
        var cb2 = c2.$getCallback("engine.update");
        
        //generally the two instances should be equal, but their
        //callbacks should return different values
        assert.strictEqual(5.0, c1.x);
        assert.strictEqual(5.0, c2.x);
        assert.isUndefined(c1.foo);
        assert.isUndefined(c2.foo);
        assert.strictEqual('bar', cb1());
        assert.strictEqual('baz', cb2());
    });
    
});
*/
