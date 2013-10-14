//TODO: REFACTOR TO USE FIXTURES PROPERLY
'use strict';

var chai = require('chai')
    , spies = require('chai-spies')
    , assert = chai.assert
    , expect = chai.expect
    , Javelin = require('../build/javelin.js')
;
chai.use(spies);
chai.Assertion.includeStack = true;

describe("Engine", function() {
    
    var javelin, spies, Fixtures;

    //before each test create an empty javelin
    //repository and register the test fixtures
    beforeEach(function() {
        //TODO: don't allow fixtures to be cached
        Fixtures = require('../build/fixtures.js');
        javelin = Javelin.createNewInstance();
        spies = {};

        //components
        javelin.component('foo', Fixtures.FooComponent);

        //test plugins
        javelin.plugin('test', Fixtures.Plugin, Fixtures.DefaultPluginConfig);

        //test prefabs
        javelin.prefab('foo', Fixtures.FooPrefab);
        javelin.prefab('bar', Fixtures.BarPrefab);
        javelin.prefab('baz', Fixtures.BazPrefab);

        //test scenes
        javelin.scene('example', Fixtures.Scene);

        //test loaders
        javelin.loader(['.mp3','.ogg'], ['test'], Fixtures.SoundLoader);
        javelin.loader(['.png','.jpg','.jpeg','.gif'], ['test'], Fixtures.ImageLoader);
        
        //test environment
        javelin.environment('test', Fixtures.Environment, {foo: 'bar', baz: 'baz'});
    });

    function createEngine(noGameConfig) {
        if (noGameConfig || false) {
            return javelin.createGame('test');
        } else {
            return javelin.createGame('test', Fixtures.GameConfig);
        }
    }

    it("should step with no components and or objects", function() {
        createEngine().step();
    });
    
    it("should throw error when failing to load a plugin", function() {
        var game = createEngine();
        assert.throws(function() {
            game.loadPlugin('foo');
        }, /unknown plugin/);
    });

    it("should properly load and unload plugins", function() {
        var game, plugin;

        game = createEngine();
        assert.isFalse(game.getPlugin('test'));
        game.loadPlugin('test');
        plugin = game.getPlugin('test');
        assert.isTrue(plugin instanceof Javelin.Plugin);

        //plugin received default config
        assert.deepEqual(plugin.config, Fixtures.DefaultPluginConfig);
        
        //plugin received config from game
        game = createEngine(true);
        game.loadPlugin('test');
        plugin = game.getPlugin('test');
        assert.deepEqual(plugin.config, Fixtures.GameConfig.plugins.test);

        //plugin received config from scene
        game = createEngine(true);
        game.loadPlugin('test');
        plugin = game.getPlugin('test');
        assert.deepEqual(plugin.config, Fixtures.GameConfig.plugins.test);
    });

    it("should notify plugins on step");

    it("should properly instantiate simple entities");

    it("should properly instantiate complex entities");

    it("should properly destroy entities");

    it("should retrieve entities by id");

    it("should load and unload scenes"); //ensure proper callbacks called

    it("should instantiate plugins when loading scenes");

    it("should load required assets when loading scenes");

    it("should instantiate entities when loading scenes");
    
    it("should load required assets when loading scenes");
    
    it("should call plugins on entity create and destroy");
    
    it("should notify plugins on prefab instantiate and destroy");

    it("should notify plugins on flush");

    it("should step with no errors");

    it("should call entity component callbacks on create/destroy and update");
                
    it("should properly instantiate and destroy entities during update step");
    
    it("should emit events emitted by root entities");
    
    it("should dispatch events to root level entities");

});
//*/
