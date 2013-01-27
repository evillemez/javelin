'use strict';

var assert = require('assert');
var j = require('../build/javelin.min.js');

describe("GameObjectComponent Tests", function() {
    it("should return false if requested callback does not exist", function() {
        var c = new j.GameObjectComponent();
        assert.strictEqual(false, c.$getCallback("update"));
    });
    
    it("should return registered callback function if exists", function() {
        var c = new j.GameObjectComponent();

        c.$on('update', function() {
            return "foo";
        });

        var cb = c.$getCallback("update");
        assert.strictEqual("foo", cb());
    });
    
    it("should overwrite previously registered callback", function() {
        var c = new j.GameObjectComponent();

        c.$on('update', function() {
            return "foo";
        });

        c.$on('update', function() {
            return "bar";
        });
        
        var cb = c.$getCallback("update");
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
        
        assert.equal(true, typeof(c.foo) === 'undefined');
        assert.equal(true, typeof(c.bar) === 'undefined');
        
        c.$unserialize(data);

        assert.equal("bar", c.foo);
        assert.equal(23, c.bar);
        
        assert.deepEqual(data, c.$serialize());
    });
    
    it("should be scriptable and not cause conflicts", function() {
        
        //an example component construction function
        var Namespace = Namespace || {};
        Namespace.FooComponent = function(comp, testWord) {
            
            var foo = testWord;
            
            //all components
            comp.x = 5.0;
            
            //callback to return something "private"
            comp.$on("update", function() {
                return foo;
            });
        };
        
        //create and "setup" components
        var c1 = new j.GameObjectComponent();
        var c2 = new j.GameObjectComponent();
        Namespace.FooComponent(c1, 'bar');
        Namespace.FooComponent(c2, 'baz');
        var cb1 = c1.$getCallback("update");
        var cb2 = c2.$getCallback("update");
        
        //generally the two instances should be equal, but their
        //callbacks should return different values
        assert.equal(5.0, c1.x);
        assert.equal(5.0, c2.x);
        assert.equal(true, typeof(c1.foo) === 'undefined');
        assert.equal(true, typeof(c2.foo) === 'undefined');
        assert.equal('bar', cb1());
        assert.equal('baz', cb2());
    });
    
});
