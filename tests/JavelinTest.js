'use strict';

var assert = require('assert');

//test component setup

describe("Javelin Registry", function() {
    it("should properly assemble component chain on initialize()", function() {
        var j = require('../build/javelin.js');
        var f = require('./fixtures/fixtures.js');

        j.register(f.FooComponent);
        j.register(f.BarComponent);
        j.register(f.BazComponent);
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
        
        assert.deepEqual(expectedFoo, j.getComponentChain('f.foo'));
        assert.deepEqual(expectedBar, j.getComponentChain('f.bar'));
        assert.deepEqual(expectedBaz, j.getComponentChain('f.baz'));
    });
    
    it("should properly assemble component requirements on initialize()", function() {
        var j = require('../build/javelin.js');
        var f = require('./fixtures/fixtures.js');

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
