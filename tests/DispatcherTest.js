'use strict';

var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Dispatcher", function() {
    
    var j;
    
    beforeEach(function() {
        j = require('../build/javelin.js');
    });
    
    it("should register listeners and dispatch events without errors", function() {
        var d = new j.Dispatcher();
        
        d.on('foo', function() {});
        d.on('foo', function() {});
        d.on('bar', function() {});
        d.on('baz', function() {});
        
        d.dispatch('foo');
        d.dispatch('qux');
    });
    
    it("should call user-defined callback upon completion of dispatching an event", function() {
        var d = new j.Dispatcher();
        var called = false;

        var cb = function(stopped) {
            called = true;
        };
        
        d.dispatch('foo', null, cb);
        
        assert.isTrue(called);
    });
    
    it("should dispatch data to multiple listeners", function() {
        var d = new j.Dispatcher();
        var listener1Called = false;
        var listener2Called = false;
        var listener3Called = false;
        
        var listener1 = function(data) {
            assert.strictEqual(data.foo, 'bar');
            assert.isFalse(listener2Called);
            assert.isFalse(listener3Called);
            data.foo = 'changed';
            listener1Called = true;
        };

        var listener2 = function(data) {
            assert.strictEqual(data.foo, 'changed');
            assert.isTrue(listener1Called);
            assert.isFalse(listener3Called);
            listener2Called = true;
        };

        var listener3 = function(data) {
            throw new Error("this should not get called...");
        };
        
        d.on('foo', listener1);
        d.on('foo', listener2);
        d.on('bar', listener3);
        
        assert.isTrue(d.dispatch('foo', {foo: 'bar'}));
        assert.isTrue(listener1Called);
        assert.isTrue(listener2Called);
        assert.isFalse(listener3Called);
    });
    
    it("should stop event propagation when a listener returns false", function() {
        var d = new j.Dispatcher();
        var listener1Called = false;
        var listener2Called = false;
        
        var listener1 = function(data) {
            listener1Called = true;
            return false;
        };

        var listener2 = function(data) {
            throw new Error("Should not be called!");
        };
        
        d.on('foo', listener1);
        d.on('foo', listener2);
        
        assert.isFalse(d.dispatch('foo', {foo: 'bar'}));
        assert.isTrue(listener1Called);
        assert.isFalse(listener2Called);
    });

});