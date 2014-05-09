'use strict';

var Javelin = require('../build/javelin/dist/javelin.core.js');
var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Javelin", function () {

    it("should detect string literals", function() {
        var a = 'foo';
        var b = '34';
        var c = 34;
        
        assert.isTrue(Javelin.isString(a));
        assert.isTrue(Javelin.isString(b));
        assert.isFalse(Javelin.isString(c));
    });
    
    it("should detect empty object and array literals", function() {
        var a = [];
        var b = {};
        var c = [1];
        var d = {foo: null};
        
        assert.isTrue(Javelin.isEmpty(a));
        assert.isTrue(Javelin.isEmpty(b));
        assert.isFalse(Javelin.isEmpty(c));
        assert.isFalse(Javelin.isEmpty(d));
    });

    it("should determine if a value is an array literal", function() {
        assert.isFalse(Javelin.isArray(5));
        assert.isFalse(Javelin.isArray('foo'));
        assert.isFalse(Javelin.isArray({foo: 'bar'}));
        assert.isTrue(Javelin.isArray([]));
        assert.isTrue(Javelin.isArray([5, 'foo']));        
    });
    
    it("should determine if a value is a function", function() {
        assert.isFalse(Javelin.isFunction(5));
        assert.isFalse(Javelin.isFunction('foo'));
        assert.isFalse(Javelin.isFunction([5]));
        assert.isFalse(Javelin.isFunction({foo: 'bar'}));
        assert.isTrue(Javelin.isFunction(function() {}));
    });
    
    it("should determine if a value is an object", function() {
        assert.isFalse(Javelin.isObject(5));
        assert.isFalse(Javelin.isObject('foo'));
        assert.isFalse(Javelin.isObject([5]));
        assert.isTrue(Javelin.isObject({}));
    });

    it("should instantiate a singleton registry", function() {
        var javelin = Javelin.createNewInstance();

        assert.isTrue(javelin instanceof Javelin.Registry);
        assert.isTrue(javelin === Javelin.getInstance());
        assert.isFalse(javelin === Javelin.createNewInstance());
    });

});
