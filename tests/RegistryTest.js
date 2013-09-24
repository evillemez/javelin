'use strict';

var Javelin = require('../build/javelin.js');
var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Javelin Registry", function() {
    
    var javelin;
    
    beforeEach(function() {
        javelin = Javelin.createNewInstance();
    });

    it("should not register invalid components", function() {
        //no name
        assert.throws(function() {
            javelin.component();
        }, /specify a string name/);

        //no function
        assert.throws(function() {
            javelin.component('foo');
        }, /must be functions/);

        //bad requirements
        assert.throws(function() {
            javelin.component('foo', function() {}, {foo: 'bar'});
        }, /must be an array/);
    });

    it("should register valid components", function() {
        javelin.component('foo', function(entity, game) {}, ['transform2d']);
    });

    it("should not register invalid scenes");
    it("should register valid scenes");
    
    it("should not register invalid prefabs");
    it("should register valid prefabs");
    
    it("should not register invalid plugins");
    it("should register valid plugins");

    it("should not register invalid environments");
    it("should register valid environments");

    it("should not register invalid loaders");
    it("should register valid loaders");

    it("should instantiate game instances");
    
    it("should properly assemble component requirements on optimize()");
    it("should properly unpack prefab definitions upon optimize()");
});
