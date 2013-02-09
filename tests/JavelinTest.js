'use strict';

var assert = require('assert');

//test component setup

describe("Javelin Registry", function() {
    it("should properly assemble component chain on initialize()", function() {
        var j = require('../build/javelin.js');

        function FooComponent(go, comp) {}
        FooComponent.alias = 'c.foo';
        j.register(FooComponent);

        function BarComponent(go, comp) {}
        BarComponent.alias = 'c.bar';
        BarComponent.inherits = FooComponent;
        j.register(BarComponent);

        function BazComponent(go, comp) {}
        BazComponent.alias = 'c.baz';
        BazComponent.inherits = BarComponent;
        j.register(BazComponent);
        
        var expectedFoo = [
            FooComponent
        ];

        var expectedBar = [
            FooComponent,
            BarComponent
        ];
        
        var expectedBaz = [
            FooComponent,
            BarComponent,
            BazComponent
        ];
        
        j.initialize();
        
        assert.deepEqual(expectedFoo, j.getComponentChain('c.foo'));
        assert.deepEqual(expectedBar, j.getComponentChain('c.bar'));
        assert.deepEqual(expectedBaz, j.getComponentChain('c.baz'));
    });
    
    it("should properly assemble component requirements on initialize()", function() {
        var j = require('../build/javelin.js');

        function FooComponent(go, comp) {}
        FooComponent.alias = 'c.foo';
        j.register(FooComponent);

        function BarComponent(go, comp) {}
        BarComponent.alias = 'c.bar';
        BarComponent.requires = [FooComponent];
        j.register(BarComponent);

        function BazComponent(go, comp) {}
        BazComponent.alias = 'c.baz';
        BazComponent.requires = [BarComponent];
        j.register(BazComponent);
        
        function QuxComponent(go, comp) {}
        QuxComponent.alias = 'c.qux';
        QuxComponent.requires = [FooComponent, BazComponent];
        j.register(QuxComponent);
        
        var expectedFoo = [];
        
        var expectedBar = [
            FooComponent
        ];
        
        var expectedBaz = [
            FooComponent,
            BarComponent
        ];
        
        var expectedQux = [
            FooComponent,
            BarComponent,
            BazComponent
        ];
        
        j.initialize();
        
        assert.deepEqual(expectedFoo, j.getComponentRequirements('c.foo'));
        assert.deepEqual(expectedBar, j.getComponentRequirements('c.bar'));
        assert.deepEqual(expectedBaz, j.getComponentRequirements('c.baz'));
        assert.deepEqual(expectedQux, j.getComponentRequirements('c.qux'));
    });
});
