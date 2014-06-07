'use strict';

var chai = require('chai')
    , spies = require('chai-spies')
    , assert = chai.assert
    , expect = chai.expect
    , Javelin = require('../build/javelin/dist/javelin.core.js')
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
        javelin.component('foo', [], Fixtures.FooComponent);
        javelin.component('bar', ['foo'], Fixtures.BarComponent);
        javelin.component('baz', ['bar'], Fixtures.BazComponent);
        javelin.component('manager', [], Fixtures.ManagerComponent);

        //test plugins
        javelin.plugin('test', Fixtures.Plugin, Fixtures.DefaultPluginConfig);

        //test prefabs
        javelin.prefab('foo', Fixtures.FooPrefab);
        javelin.prefab('bar', Fixtures.BarPrefab);
        javelin.prefab('baz', Fixtures.BazPrefab);
        javelin.prefab('manager', Fixtures.ManagerPrefab);

        //test scenes
        javelin.scene('basic', Fixtures.SimpleScene);
        javelin.scene('complex', Fixtures.ComplexScene);
        javelin.scene('empty', Fixtures.EmptyScene);

        //test loaders
        javelin.loader(['.mp3','.ogg'], ['test'], Fixtures.SoundLoader);
        javelin.loader(['.png','.jpg','.jpeg','.gif'], ['test'], Fixtures.ImageLoader);
        
        //test environment
        javelin.environment('test', Fixtures.Environment, Fixtures.DefaultEnvirnonmentConfig);
        javelin.optimize();
    });

    function createEngine() {
        return javelin.createGame('test');
    }

    function createEngineWithConfig() {
        return javelin.createGame('test', Fixtures.GameConfig);
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
        game = createEngineWithConfig();
        game.loadPlugin('test');
        plugin = game.getPlugin('test');
        assert.deepEqual(plugin.config, Fixtures.GameConfig.plugins.test);

        //plugin received config from scene
        game = createEngineWithConfig();
        game.loadPlugin('test');
        plugin = game.getPlugin('test');
        assert.deepEqual(plugin.config, Fixtures.GameConfig.plugins.test);
    });

    it("should notify plugins on step", function() {
        var engine = createEngineWithConfig();
        engine.loadPlugin('test');
        var plugin = engine.getPlugin('test');

        assert.strictEqual(plugin.preUpdates, 0);
        assert.strictEqual(plugin.postUpdates, 0);
        engine.step();
        assert.strictEqual(plugin.preUpdates, 1);
        assert.strictEqual(plugin.postUpdates, 1);
    });

    it("should not notify disabled plugins on step", function() {
        var engine = createEngineWithConfig();
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
                    foo: 500
                }
            }
        });

        assert.isTrue(ent instanceof Javelin.Entity);
        assert.deepEqual(ent.tags, ['example']);
        assert.strictEqual(ent.name, 'Anonymous');
        assert.strictEqual(ent.id, 1);
        assert.isTrue(ent.hasComponent('foo'));
        assert.strictEqual(ent.get('foo').foo, 500);
    });

    it("should properly instantiate complex entities", function() {
        var engine = createEngineWithConfig();
        var ent = engine.instantiate('baz');

        assert.isTrue(ent instanceof Javelin.Entity);
        assert.isTrue(ent.hasComponent('foo'));
        assert.isTrue(ent.hasComponent('bar'));
        assert.isTrue(ent.hasComponent('baz'));
        assert.strictEqual(ent.get('baz').baz, 'bazz');
        assert.strictEqual(ent.get('foo').foo, 500);
        assert.strictEqual(ent.children.length, 2);

        assert.strictEqual(ent.children[0].id, 2);
        assert.isTrue(ent.children[0].hasComponent('foo'));
        assert.isTrue(ent.children[0].hasComponent('bar'));
        assert.strictEqual(ent.children[1].id, 3);
        assert.isTrue(ent.children[1].hasComponent('foo'));
        assert.isTrue(ent.children[1].hasComponent('bar'));
    });
  
    it("should instantiate entities during update", function() {
        var engine = createEngine();

        engine.step();
        assert.strictEqual(engine.gos.length, 0);
        engine.step();
        assert.strictEqual(engine.gos.length, 0);

        var manager = engine.instantiate('manager');
        manager.get('manager').setMode('create');
        assert.strictEqual(engine.gos.length, 1);

        engine.step();
        assert.strictEqual(engine.gos.length, 2);
        engine.step();
        assert.strictEqual(engine.gos.length, 3);
        engine.step();
        assert.strictEqual(engine.gos.length, 4);
        engine.step();
        assert.strictEqual(engine.gos.length, 5);

        engine.step();
        assert.strictEqual(engine.gos.length, 5);

        manager.destroy();
        engine.step();
        assert.strictEqual(engine.gos.length, 0);
    });

    it("should properly destroy entities during update", function() {
        var engine = createEngine();

        engine.step();
        assert.strictEqual(engine.gos.length, 0);
        engine.step();
        assert.strictEqual(engine.gos.length, 0);

        //create some entities
        var manager = engine.instantiate('manager');
        manager.get('manager').setMode('create');
        engine.step();
        engine.step();
        engine.step();
        engine.step();
        engine.step();
        assert.strictEqual(engine.gos.length, 5);

        //destroy some entities
        manager.get('manager').setMode('destroy');
        engine.step();
        assert.strictEqual(engine.gos.length, 4);
        engine.step();
        assert.strictEqual(engine.gos.length, 3);
        engine.step();
        assert.strictEqual(engine.gos.length, 2);
        engine.step();
        assert.strictEqual(engine.gos.length, 1);

        engine.step();
        engine.step();
        assert.strictEqual(engine.gos.length, 1);

        manager.destroy();
        engine.step();
        assert.strictEqual(engine.gos.length, 0);
    });

    it("should retrieve entities by id", function() {
        var engine = createEngine();
        var foo = engine.instantiate('foo');
        var bar = engine.instantiate('bar');
        var baz = engine.instantiate('baz');

        assert.strictEqual(foo.id, 1);
        assert.strictEqual(bar.id, 2);
        assert.strictEqual(baz.id, 3);

        var ent = engine.getEntityById(1);
        assert.deepEqual(ent, foo);
        ent = engine.getEntityById(2);
        assert.deepEqual(ent, bar);
        ent = engine.getEntityById(3);
        assert.deepEqual(ent, baz);
    });

    it("should load and unload scenes", function() {
        var engine = createEngine();
        var called = false;

        assert.isFalse(called);

        engine.loadScene('basic', function() {
            called = true;
        });

        assert.isTrue(called);
        assert.isTrue(engine.gos.length > 0);

        engine.unloadScene();
        assert.strictEqual(engine.gos.length, 0);
    });

    it("should instantiate plugins defined in game when loading scenes", function() {
        var engine = createEngineWithConfig();

        assert.isFalse(engine.getPlugin('test'));
        engine.loadScene('basic', Javelin.noop);
        var plugin = engine.getPlugin('test');
        assert.isTrue(plugin instanceof Javelin.Plugin);
        assert.strictEqual(plugin.config.foo, 'bar');
        assert.strictEqual(plugin.config.bar, 'baz');
    });

    it("should instantiate plugins defined in scene when loading scenes", function() {
        var engine = createEngineWithConfig();

        assert.isFalse(engine.getPlugin('test'));
        engine.loadScene('complex', Javelin.noop);
        var plugin = engine.getPlugin('test');
        assert.isTrue(plugin instanceof Javelin.Plugin);
        assert.strictEqual(plugin.config.foo, 500);
        assert.strictEqual(plugin.config.bar, 600);
    });

    it.skip("should load required assets when loading scenes", function() {
        //TODO: implement idea in README for required assets
    });

    it("should instantiate entities when loading scenes", function() {
        var engine = createEngineWithConfig();

        assert.strictEqual(engine.gos.length, 0);
        engine.loadScene('basic', Javelin.noop);
        assert.strictEqual(engine.gos.length, 8);
    });
        
    it("should call plugins on entity create and destroy", function() {
        var engine = createEngineWithConfig();
        engine.loadScene('empty', Javelin.noop);
        var plugin = engine.getPlugin('test');

        assert.strictEqual(plugin.entitiesCreated, 0);
        assert.strictEqual(plugin.entitiesDestroyed, 0);
        var ent1 = engine.instantiate('foo');
        assert.strictEqual(plugin.entitiesCreated, 1);
        assert.strictEqual(plugin.entitiesDestroyed, 0);
        var ent2 = engine.instantiate('foo');
        assert.strictEqual(plugin.entitiesCreated, 2);
        assert.strictEqual(plugin.entitiesDestroyed, 0);

        ent1.destroy();
        assert.strictEqual(plugin.entitiesCreated, 2);
        assert.strictEqual(plugin.entitiesDestroyed, 1);
        ent2.destroy();
        assert.strictEqual(plugin.entitiesCreated, 2);
        assert.strictEqual(plugin.entitiesDestroyed, 2);
    });
    
    it("should notify plugins on prefab instantiate and destroy", function() {
        var engine = createEngineWithConfig();
        engine.loadScene('empty', Javelin.noop);
        var plugin = engine.getPlugin('test');

        assert.strictEqual(plugin.entitiesCreated, 0);
        assert.strictEqual(plugin.prefabsCreated, 0);
        var ent1 = engine.instantiate('foo');
        assert.strictEqual(plugin.entitiesCreated, 1);
        assert.strictEqual(plugin.prefabsCreated, 1);

        var ent2 = engine.instantiate('baz');
        assert.strictEqual(plugin.entitiesCreated, 4);
        assert.strictEqual(plugin.prefabsCreated, 2);

        ent1.destroy();
        assert.strictEqual(plugin.entitiesDestroyed, 1);
        assert.strictEqual(plugin.prefabsDestroyed, 1);

        ent2.destroy();
        assert.strictEqual(plugin.entitiesDestroyed, 4);
        assert.strictEqual(plugin.prefabsDestroyed, 2);
    });

    it("should notify plugins on flush", function() {
        var engine = createEngineWithConfig();
        engine.loadScene('empty', Javelin.noop);
        var plugin = engine.getPlugin('test');

        assert.strictEqual(plugin.flushes, 0);
        engine.flush();
        assert.strictEqual(plugin.flushes, 1);
    });

    it("should notify plugins on load and unload", function() {
        var engine = createEngineWithConfig();
        engine.loadPlugin('test');
        var plugin = engine.getPlugin('test');

        assert.isTrue(plugin.loaded, 1);
        assert.isFalse(plugin.unloaded, 0);

        engine.unloadPlugin('test');
        assert.isTrue(plugin.loaded, 1);
        assert.isTrue(plugin.unloaded, 1);
    });

    it("should notify plugins after scene loads", function() {
        var engine = createEngineWithConfig();
        engine.loadScene('empty', Javelin.noop);
        var plugin = engine.getPlugin('test');

        assert.isTrue(plugin.sceneLoaded);
    });

    it("should step with no errors and a loaded scene", function() {
        var engine = createEngineWithConfig();
        engine.loadScene('complex', Javelin.noop);
        engine.step();
    });

    it("should call entity component callbacks on create/destroy and update", function() {
        var engine = createEngineWithConfig();
        var ent = engine.instantiate('foo');
        var foo = ent.get('foo');

        assert.isTrue(foo.created);
        assert.isFalse(foo.updated);
        assert.isFalse(foo.destroyed);

        engine.step();
        assert.isTrue(foo.created);
        assert.isTrue(foo.updated);
        assert.isFalse(foo.destroyed);

        ent.destroy();
        assert.isTrue(foo.created);
        assert.isTrue(foo.updated);
        assert.isTrue(foo.destroyed);
    });
    
    it("should broadcast events to root level entities", function() {
        var engine = createEngineWithConfig();
        var ent = engine.instantiate('foo');

        var data = {called: false};
        ent.on('foo.event', function(eventData) {
            data = eventData;
        });

        assert.isFalse(data.called);
        engine.broadcast('foo.event', [{called: true}]);
        assert.isTrue(data.called);
    });

});
