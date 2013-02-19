'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');
var f = require('./fixtures/fixtures.js');

describe("Javelin Registry", function() {

    beforeEach(function() {
        j.reset();
    });
    
    it("should properly assemble component chain on initialize()", function() {
        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);
        j.register(f.QuxComponent);
        j.initialize();
        
        var expectedFoo = [
            f.FooComponent
        ];

        var expectedBar = [
            f.FooComponent,
            f.BarComponent
        ];
        
        var expectedBaz = [
            f.FooComponent,
            f.BarComponent,
            f.BazComponent
        ];
        
        var expectedQux = [
            f.QuxComponent,
        ];
        
        assert.deepEqual(expectedFoo, j.getComponentChain('f.foo'));
        assert.deepEqual(expectedBar, j.getComponentChain('f.bar'));
        assert.deepEqual(expectedBaz, j.getComponentChain('f.baz'));
        assert.deepEqual(expectedQux, j.getComponentChain('f.qux'));
    });
    
    it("should properly assemble component requirements on initialize()", function() {
        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);        
        j.register(f.QuxComponent);
        j.initialize();
        
        var expectedFoo = [];
        
        var expectedBar = [
            f.FooComponent
        ];
        
        var expectedBaz = [
            f.FooComponent,
            f.BarComponent
        ];
        
        var expectedQux = [
            f.FooComponent,
            f.BarComponent,
            f.BazComponent
        ];
        
        assert.deepEqual(expectedFoo, j.getComponentRequirements('f.foo'));
        assert.deepEqual(expectedBar, j.getComponentRequirements('f.bar'));
        assert.deepEqual(expectedBaz, j.getComponentRequirements('f.baz'));
        assert.deepEqual(expectedQux, j.getComponentRequirements('f.qux'));
    });
});
