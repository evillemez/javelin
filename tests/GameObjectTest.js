'use strict';

var assert = require('assert');
var j = require('../build/javelin.js');

//test component setup
function FooComponent(go, comp) {
    
}
FooComponent.alias = 'c.foo';

function BarComponent(go, comp) {
    
}
BarComponent.alias = 'c.bar';
BarComponent.inherits = FooComponent;

function BazComponent(go, comp) {
    
}
BazComponent.alias = 'c.baz';
BazComponent.requires = [FooComponent];


describe("GameObject Tests", function() {
    it("should instantiate properly", function() {
        var go = new j.GameObject();
    });
    
    
});
