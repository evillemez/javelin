'use strict';

var Javelin = require('../../build/javelin.js');

//setup fixtures namespaces
var Fixtures = Fixtures || {};
Fixtures.Component = {};
Fixtures.Prefab = {};
Fixtures.Scene = {};
Fixtures.Plugin = {};
Fixtures.Env = {};

/* GO Components with inheritence */

Fixtures.Component.FooComponent = function(go, comp) {
    comp.numUpdates = 0;
    comp.started = false;
    comp.destroyed = false;
    comp.test = function() { return "foo"; };
    
    comp.$on('engine.create', function() {
        comp.started = true;
    });
    
    comp.$on('engine.update', function(deltaTime) {
        comp.numUpdates++;
    });
    
    comp.$on('engine.destroy', function() {
        comp.destroyed = true;
    });
};
Fixtures.Component.FooComponent.alias = 'f.foo';
Fixtures.Component.BarComponent = function(go, comp) {
    comp.test = function() { return "bar"; };
};
Fixtures.Component.BarComponent.alias = 'f.bar';
Fixtures.Component.BarComponent.inherits = 'f.foo';

Fixtures.Component.BazComponent = function(go, comp) {
    comp.test = function() { return "baz"; };
};
Fixtures.Component.BazComponent.alias = 'f.baz';
Fixtures.Component.BazComponent.inherits = 'f.bar';
        
Fixtures.Component.QuxComponent = function(go, comp) {
    comp.test = function() { return "qux"; };
};
Fixtures.Component.QuxComponent.alias = 'f.qux';

Fixtures.Component.BlahComponent = function(go, comp) {
    comp.test = function() { return "blah"; };
};
Fixtures.Component.BlahComponent.alias = 'f.blah';
Fixtures.Component.BlahComponent.inherits = 'f.foo';

/* GO Components with requirements */
Fixtures.Component.Blar = function() {};
Fixtures.Component.Blar.alias = 'f.blar';
Fixtures.Component.Blag = function() {};
Fixtures.Component.Blag.alias = 'f.blag';
Fixtures.Component.Blaz = function() {};
Fixtures.Component.Blaz.alias = 'f.blaz';
Fixtures.Component.Blaz.requires = ['f.blar','f.blag'];
Fixtures.Component.Blav = function() {};
Fixtures.Component.Blav.alias = 'f.blav';
Fixtures.Component.Blav.requires = ['f.blar', 'f.blaz'];

/* GO Components with inheritence & requirements */

Fixtures.Component.Quip = function() {};
Fixtures.Component.Quip.alias = 'f.quip';
Fixtures.Component.Quip.inherits = 'f.blav';
Fixtures.Component.Quip.requires = ['f.blaz'];
Fixtures.Component.Shqip = function() {};
Fixtures.Component.Shqip.alias = 'f.shqip';
Fixtures.Component.Shqip.requires = ['f.quip', 'f.baz'];

Fixtures.Component.ManagerComponent = function(go, comp) {
    var max = 4;
    var gos = [];
    
    comp.$on('engine.create', function() {
        for (var i=0; i < max; i++) {
            gos.push(go.engine.instantiateObject({components: {'f.qux': {}}}));
        }
    });
    
    comp.$on('engine.update', function(deltaTime) {
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
Fixtures.Component.ManagerComponent.alias = 'f.manager';


/* Engine Plugins */

Fixtures.Plugin.TestPlugin = function(plugin, config) {
    plugin.config = config;
    plugin.stepCount = 0;
    plugin.initialized = false;
    plugin.goCount = 0;
    
    plugin.$onLoad = function() {
        plugin.initialized = true;
    };
    
    plugin.$onUnload = function() {
        plugin.initialized = false;
    };
    
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
Fixtures.Plugin.TestPlugin.alias = 'f.test_plugin';
Fixtures.Plugin.TestPlugin.defaults = {
    foo: 'foo',
    bar: 'bar'
};

/* Engine Test Environment */

Fixtures.Env.TestEnvironment = function() {};
Fixtures.Env.TestEnvironment.prototype = new Javelin.Environment();

/* Object definition "prefab" */

Fixtures.Prefab.Prefab1 = {
    name: "f.testPrefab",
    components: {
        "sprite": {}
    }
};

Fixtures.Prefab.Prefab2 = {
    name: "f.managerPrefab",
    components: {
        "f.manager": {}
    }
};

Fixtures.Prefab.Prefab3 = {
    name: 'f.nestedPrefab',
    components: {
        'f.foo': {}
    },
    children: [
        'f.testPrefab',
        {
            name: 'nested',
            components: {
                'f.bar': {}
            }
        }
    ]
};

Fixtures.Prefab.Prefab4 = {
    name: 'f.prefab4',
    components: {
        'f.blah': {}
    }
};

/* Test scene */

Fixtures.Scene.Scene1 = {
    name: 'f.scene1',
    plugins: {
        'f.test_plugin': {
            foo: 'baz'
        }
    },
    objects: [
        'f.testPrefab',
        'f.testPrefab',
        {
            name: 'example',
            components: {
                'f.foo': {}
            }
        }
    ]
};

Fixtures.Scene.Scene2 = {
    name: 'f.scene2',
    plugins: {
        'f.test_plugin': {
            foo: 'qux'
        }
    },
    objects: [
        'f.testPrefab',
        'f.managerPrefab'
    ]
};

/* Main game configuration */
Fixtures.GameConfig = {
    name: "Test game",
    autoregisterPlugins: Fixtures.Plugin,
    autoregisterScenes: Fixtures.Scene,
    autoregisterPrefabs: Fixtures.Prefab,
    autoregisterComponents: Fixtures.Component,
    plugins: {
        'f.test_plugin': {
            foo: 'override'
        }
    }
};

//export
module.exports = Fixtures;
