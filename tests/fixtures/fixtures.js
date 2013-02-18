'use strict';

var Javelin = require('../../build/javelin.js');

var Fixtures = Fixtures || {};

/* GO Components */

Fixtures.FooComponent = function(go, comp) {
    comp.test = function() { return "foo"; };
    comp.numUpdates = 0;
    comp.$on('update', function(deltaTime) {
        comp.numUpdates++;
    });
};
Fixtures.FooComponent.alias = 'f.foo';

Fixtures.BarComponent = function(go, comp) {
    comp.test = function() { return "bar"; };
};
Fixtures.BarComponent.alias = 'f.bar';
Fixtures.BarComponent.inherits = 'f.foo';
Fixtures.BarComponent.requires = ['f.foo'];

Fixtures.BazComponent = function(go, comp) {
    comp.test = function() { return "baz"; };
};
Fixtures.BazComponent.alias = 'f.baz';
Fixtures.BazComponent.inherits = 'f.bar';
Fixtures.BazComponent.requires = ['f.bar'];
        
Fixtures.QuxComponent = function(go, comp) {
    comp.test = function() { return "qux"; };
};
Fixtures.QuxComponent.alias = 'f.qux';
Fixtures.QuxComponent.requires = ['f.foo','f.baz'];

/* Engine Plugins */

Fixtures.TestPlugin = function(plugin, config) {

    plugin.stepCount = 0;
    plugin.goCount = 0;

    plugin.$onStep = function(deltaTime) {
        plugin.stepCount++;
    };
    
    plugin.$onGameObjectCreate = function(go) {
        plugin.goCount++;
    };

    plugin.$onGameObjectDestroy = function(go) {
        plugin.goCount--;
    };
};
Fixtures.TestPlugin.alias = 'f.test_plugin';

/* Engine Test Environment */

Fixtures.TestEnvironment = function() {};
Fixtures.TestEnvironment.prototype = new Javelin.Environment();

//export
module.exports = Fixtures;