/*global PIXI: true */

/**
 * The pixi plugin creates a pixi stage per configured layer in the scene.  Prefabs that
 * contain any renderable pixi components are automatically added/removed from
 * the scene during the entity lifecycle.
 *
 * @apidoc package.pixi.plugin.html
 * @type plugin
 */
javelin.plugin('pixi', function(config) {

    var self = this;
    var engine = this.$engine;

    var layers = {
        default: {
            renderer: null,
            stage: null,
            camera: null
        }
    };

    var cameras = {};

    /**
     * Create pixi stages per configured layer on load.
     */
    this.$onLoad = function() {
        //can only be active if in a browser context
        if (!window || !window.PIXI) {
            this.$enabled = false;
            console.log ('Disabling the PIXI plugin - no window or PIXI library detected.');
        }

        //TODO: create stages and cameras

    };

    this.$onPostUpdate = function(deltaTime) {
        //have renderable instances update their positions by normalizing
        //transform position to canvas position
        engine.broadcast('pixi.position');

        //hide renderable instances that are off screen
        engine.broadcast('pixi.cull');

        //for any components to want to use a "PIXI.Graphics" instance to
        //procedurally draw something
        engine.broadcast('pixi.draw');

        //TODO: render each layer
    };

    /**
     * Adds prefab renderable hierarchy to stage/layer when a prefab is created.
     */
    this.$onPrefabCreate = function(prefab) {
        var renderable = prefab.get('pixi.renderable');

        if (!renderable) return;

        var pixiDisplayObject = renderable.getDisplayObject(true);

        //add to stage for the layer
        self.getLayer(renderable.layer).stage.addChild(pixiDisplayObject);
    };

    /**
     * Removes renderable prefab hierarchy from the layer when destroyed.
     */
    this.$onPrefabDestroy = function(prefab) {
        var renderable = prefab.get('pixi.renderable');
        if (!renderable) return;

        var pixiDisplayObject = renderable.getDisplayObject(true);

        self.getLayer(renderable.layer).stage.removeChild(pixiDisplayObject);
    };
});
