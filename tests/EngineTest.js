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
        javelin.environment('test', Fixtures.Environment, Fixtures.DefaultEnvirnonmentConfig);
    });

    function createEngine(withConfig) {
        var config = (withConfig === true) ? true : false;
        if (config) {
            return javelin.createGame('test', Fixtures.GameConfig);
        } else {
            return javelin.createGame('test');
        }
    }

    it("should step with no components and or objects", function() {
        createEngine().step();
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

    it("should notify plugins on step", function() {
        var engine = createEngine(true);
        engine.loadPlugin('test');
        var plugin = engine.getPlugin('test');

        assert.strictEqual(plugin.preUpdates, 0);
        assert.strictEqual(plugin.postUpdates, 0);
        engine.step();
        assert.strictEqual(plugin.preUpdates, 1);
        assert.strictEqual(plugin.postUpdates, 1);
    });

    it("should not notify disabled plugins on step", function() {
        var engine = createEngine(true);
        engine.loadPlugin('test');
        var plugin = engine.getPlugin('test');
        plugin.$enabled = false;

        assert.strictEqual(plugin.preUpdates, 0);
        assert.strictEqual(plugin.postUpdates, 0);
        engine.step();
        assert.strictEqual(plugin.preUpdates, 0);
        assert.strictEqual(plugin.postUpdates, 0);
    });

    it("should properly instantiate simple entities", function() {
        var engine = createEngine();
        var ent = engine.instantiateEntity({
            tags: ['example'],
            components: {
                'foo': {
                    bar: 500
                }
            }
        });

        assert.isTrue(ent instanceof Javelin.Entity);
        assert.deepEqual(ent.tags, ['example']);
        assert.strictEqual(ent.name, 'Anonymous');
        assert.strictEqual(ent.id, 1);
        assert.isTrue(ent.hasComponent('foo'));
        assert.strictEqual(ent.get('foo').bar, 500);
    });

    it("should properly instantiate complex entities", function() {

    });

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

    it("should step with no errors and a loaded scene");

    it("should call entity component callbacks on create/destroy and update");
                
    it("should properly instantiate and destroy entities during update step");
    
    it("should emit events emitted by root entities");
    
    it("should dispatch events to root level entities");

});
//*/
