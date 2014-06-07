'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;
var Javelin = require('../build/javelin/dist/javelin.core.js');

describe("Component", function() {

    var createComponent = function(name) {
        return new Javelin.Component(name || 'foo');
    };

    it("should have reference to its name", function() {
        var c = createComponent('foo');
        assert.strictEqual(c.$name, 'foo');
    });
        
    it("should serialize only non-function properties added to object", function() {
        var c = createComponent();
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
        var c = createComponent();
        
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
    
    it("should be scriptable not conflict with multiple entity instances", function() {
        
        //an example component construction function
        var FooComponentHandler = function(entity, game) {
            //private stuff
            var self = this;
            var foo = "hello";
            
            //public stuff
            this.x = 5.0;
            this.y = 5.0;

            //callbacks
            this.doStuff = function() {
                return [foo, self.x];
            };
        };
        
        //create and "setup" components
        var c1 = createComponent('foo');
        FooComponentHandler.call(c1, new Javelin.Entity());
        c1.$unserialize({x: 1});
        var c2 = createComponent('foo');
        FooComponentHandler.call(c2, new Javelin.Entity());
        c2.$unserialize({x: 10});
        
        //generally the two instances should be equal, but their
        //callbacks should return different values
        assert.strictEqual(5.0, c1.y);
        assert.strictEqual(5.0, c2.y);
        assert.isUndefined(c1.foo);
        assert.isUndefined(c2.foo);
        assert.deepEqual(c1.doStuff(), ["hello", 1]);
        assert.deepEqual(c2.doStuff(), ["hello", 10]);
    });
});
