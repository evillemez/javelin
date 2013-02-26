'use strict';

var Javelin = require('../../build/javelin.js');

var Fixtures = Fixtures || {};

/* GO Components */

Fixtures.FooComponent = function(go, comp) {
    comp.test = function() { return "foo"; };
    comp.numUpdates = 0;
    comp.started = false;
    comp.destroyed = false;
    
    comp.$on('create', function() {
        comp.started = true;
    });
    
    comp.$on('update', function(deltaTime) {
        comp.numUpdates++;
    });
    
    comp.$on('destroy', function() {
        comp.destroyed = true;
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

Fixtures.ManagerComponent = function(go, comp) {
    var max = 4;
    var gos = [];
    
    comp.$on('create', function() {
        for (var i=0; i < max; i++) {
            gos.push(go.engine.instantiate({components: {'f.qux': {}}}));
        }
    });
    
    comp.$on('update', function(deltaTime) {
        if (gos.length) {
            var go = gos[0];
            gos.splice(0, 1);
            go.destroy();
        } else {
            //destroy self
            comp.$go.destroy();
        }
    });
}; 
Fixtures.ManagerComponent.alias = 'f.manager';


/* Engine Plugins */

Fixtures.TestPlugin = function(plugin, config) {
    plugin.$config.foo = 'foo';
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

/* Object definition "prefab" */

Fixtures.Prefab1 = {
    name: "Test Object",
    components: {
        "sprite": {}
    }
};

Fixtures.Prefab2 = {
    name: "Manager",
    components: {
        "f.manager": {}
    }
};

/* Test scene */

Fixtures.Scene = {
    plugins: [
        
    ],
    options: {
        
    },
    objects: [
        {},
        {}
    ]
};

//export
module.exports = Fixtures;
