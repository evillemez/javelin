'use strict';

var Javelin = require('../build/javelin.js');
var chai = require('chai');
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe("Registry", function() {
    
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
        var def = javelin.getComponent('foo');
        assert.isFunction(def.handler);
    });

    it("should not register invalid scenes", function() {
        //no name
        assert.throws(function() {
            javelin.scene();
        }, /specify a string name/);        

        //no object definition
        assert.throws(function() {
            javelin.scene('foo');
        }, /must be object literals/);
    });

    it("should register valid scenes", function() {
        javelin.scene('foo', {
            plugins: {},
            entities: {}
        });

        var scene = javelin.getScene('foo');
        assert.isObject(scene.entities);
        assert.isObject(scene.plugins);
    });
    
    it("should not register invalid prefabs", function() {
        //no name
        assert.throws(function() {
            javelin.prefab();
        }, /specify a string name/);

        //no object definition
        assert.throws(function() {
            javelin.prefab('foo');
        }, /must be object literals/);
    });

    it("should register valid prefabs", function() {
        javelin.prefab('foo', {
            components: {}
        });

        var prefab = javelin.getPrefab('foo');

        assert.isObject(prefab.components);
    });
    
    it("should not register invalid plugins", function() {
        //no name
        assert.throws(function() {
            javelin.plugin();
        }, /specify a string name/);

        //no function definition
        assert.throws(function() {
            javelin.plugin('foo');
        }, /must be a function/);
    });

    it("should register valid plugins", function() {
        javelin.plugin('foo', function() {});

        var plugin = javelin.getPlugin('foo');
        assert.isFunction(plugin.handler);
    });

    it("should not register invalid environments", function() {
        //no name
        assert.throws(function() {
            javelin.environment();
        }, /specify a string name/);

        //no function definition
        assert.throws(function() {
            javelin.environment('foo');
        }, /specify a function handler/);

        //bad default config
        assert.throws(function() {
            javelin.environment('foo', function() {}, []);
        }, /be an object/);
    });

    it("should register valid environments", function () {
        javelin.environment('foo', function() {});
        var env = javelin.getEnvironment('foo');

        assert.isFunction(env.handler);
    });

    it("should not register invalid loaders", function() {
        //no file formats
        assert.throws(function() {
            javelin.loader();
        }, /specify an array of file formats/);

        //no environments specified
        assert.throws(function() {
            javelin.loader(['.mp3', '.ogg']);
        }, /specify an array of applicable environments/);

        //no handler function
        assert.throws(function() {
            javelin.loader(['.mp3', '.ogg'], ['browser']);
        }, /specify a function handler/);
    });

    it("should register valid loaders", function() {
        javelin.loader(['.mp3'], ['browser'], function() {});
        var loader = javelin.getLoader('.mp3', 'browser');
        assert.isFunction(loader);
    });

    it("should instantiate asset loaders", function() {
        javelin.loader(['.mp3'], ['browser'], function() { return 'loaded a file'; });
        var loader = javelin.createLoader('browser');
        assert.isTrue (loader instanceof Javelin.AssetLoader);
        loader.loadAsset('foo.mp3', function(result) {
            assert.strictEqual(result, 'loaded a file');
        });
    });

    it("should instantiate environments", function() {
        javelin.environment('browser', function(config) {
            this.foo = config.foo;
            this.bar = config.bar;
        }, {
            foo: 'foo',
            bar: 'bar'
        });

        var env = javelin.createEnvironment('browser');
        assert.isTrue(env instanceof Javelin.Environment);
        assert.strictEqual(env.foo, 'foo');
        assert.strictEqual(env.bar, 'bar');
        assert.isTrue(env.loader instanceof Javelin.AssetLoader);
    });

    it("should instantiate game instances", function() {
        javelin.environment('browser', function(config) {
            this.foo = config.foo || false;
            this.bar = config.bar || false;
        });

        var gameConfig = {
            environments: {
                browser: {
                    foo: 'foo',
                    bar: 'bar'                
                }
            }
        };

        var game = javelin.createGame('browser', gameConfig);

        assert.isTrue(game instanceof Javelin.Engine);
        assert.isTrue(game.loader instanceof Javelin.AssetLoader);
        assert.isTrue(game.environment instanceof Javelin.Environment);
        assert.strictEqual(game.environment.foo, 'foo');
        assert.strictEqual(game.config, gameConfig);
    });
    
    it("should properly compute component requirements on optimize()", function() {
        javelin.component('foo', function() {}, []);
        javelin.component('bar', function() {}, ['foo']);
        javelin.component('baz', function() {}, ['bar']);
        javelin.component('qux', function() {}, []);
        javelin.component('quux', function() {}, ['bar','qux']);
        javelin.component('quuxx', function() {}, ['quux','bar','foo','bar']);

        var names = ['foo','bar','baz','qux','quux','quuxx'];
        for (var name in names) {
            assert.deepEqual(javelin.getComponent(names[name]).computedRequirements, [], 'computed requirements should be empty pre-optimize');
        }

        javelin.optimize();

        assert.deepEqual(javelin.getComponent('foo').computedRequirements, []);
        assert.deepEqual(javelin.getComponent('bar').computedRequirements, ['foo']);
        assert.deepEqual(javelin.getComponent('baz').computedRequirements, ['foo','bar']);
        assert.deepEqual(javelin.getComponent('qux').computedRequirements, []);
        assert.deepEqual(javelin.getComponent('quux').computedRequirements, ['foo','bar','qux']);
        assert.deepEqual(javelin.getComponent('quuxx').computedRequirements, ['foo','bar','qux','quux']);
    });

    it("should properly unpack prefab definitions upon optimize()", function() {
        javelin.prefab('foo', {});
        javelin.prefab('bar', {
            children: [
                'foo',
                'foo'
            ]
        });

        assert.isString(javelin.getPrefab('bar').children[0]);
        assert.isString(javelin.getPrefab('bar').children[1]);

        javelin.optimize();

        assert.isObject(javelin.getPrefab('bar').children[0]);
        assert.isObject(javelin.getPrefab('bar').children[1]);
    });
});
