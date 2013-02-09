'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');

//test component setup
function FooComponent(go, comp) {
    
}
FooComponent.alias = 'c.foo';
j.register(FooComponent);

function BarComponent(go, comp) {
    
}
BarComponent.alias = 'c.bar';
BarComponent.inherits = FooComponent;
j.register(BarComponent);

function BazComponent(go, comp) {
    
}
BazComponent.alias = 'c.baz';
BazComponent.requires = [FooComponent];
j.register(BazComponent);

describe("GameObject Tests", function() {
    it("should instantiate properly", function() {
        var go = new j.GameObject();
    });
    
    
});
