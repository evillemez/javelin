/*global PIXI: true, Camera: true, Layer: true */

/**
 * The pixi plugin creates a pixi stage per configured layer in the scene.  Prefabs that
 * contain any renderable pixi components are automatically added/removed from
 * the scene during the entity lifecycle.
 *
 * @apidoc package.pixi.plugin.html
 * @type plugin
 */
javelin.plugin('pixi', function(config) {

    //internal references
    var self = this;
    var engine = this.$engine;
    var renderTarget = null;
    var layerRenderTargets = {};
    var layers = {};
    var cameras = {};

    this.createCamera = function(name, config) {
        cameras[name] = new Camera(config);
    };

    this.getCamera = function(name) {
        if (cameras[name]) {
            throw new Error('Unknown render camera '+ name +' requested.');
        }

        return layers[name];
    };

    this.getLayer = function(name) {
        if (layers[name]) {
            throw new Error('Unknown render layer '+ name +' requested.');
        }

        return layers[name];
    };

    /**
     * Create pixi stages per configured layer on load.
     */
    this.$onLoad = function() {
        //can only be active if in a browser context
        if (!window || !window.PIXI) {
            this.$enabled = false;
            console.log('Disabling the PIXI plugin - no window or PIXI library detected.');
        }

        //enforce default camera
        config.cameras = config.cameras || {};
        if (!config.cameras['default']) {
            config.cameras['default'] = {};
        }

        //create cameras
        for (var cameraName in config.cameras) {
            cameras[cameraName] = new Camera(cameraName, config.cameras[cameraName]);
        }

        //enforce a default layer
        config.layers = config.layers || {};
        if (!config.layers['default']) {
            config.layers['default'] = {
                camera: 'default',
                clearOnUpdate: true,
                pixelsPerUnit: 20
            };
        }

        //create layer instances and render targets
        renderTarget = document.selectElementById(config.renderTargetId);
        var targetStyle = window.getComputedStyle(renderTarget);
        var targetHeight = targetStyle.height;
        var targetWidth = targetStyle.width;
        var zIndex = targetStyle.zIndex || 0;
        for (var layerName in config.layers) {
            var layerConfig = config.layers[layerName];
            zIndex++;

            //create layer render target, add to DOM
            var layerRenderTarget = document.createElement('div');
            layerRenderTarget.style.height = targetHeight;
            layerRenderTarget.style.width = targetWidth;
            layerRenderTarget.style.zIndex = zIndex;
            layerRenderTarget.id = 'javelin-layer-' + layerName;
            layerRenderTargets[layerName] = layerRenderTarget;
            renderTarget.appendChild(layerRenderTarget);

            //instantiate layer with render target
            var layerInstance = new Layer(
                layerRenderTarget,
                self.getCamera(layerConfig.camera || 'default'),
                layerConfig.config
            );

            layers[layerName] = layerInstance;
        }

        //register resize listener
        window.addEventListener('resize', onWindowResize);
    };

    this.$onUnload = function() {
        //remove added layer render targets
        for (var name in layers) {
            renderTarget.removeChild(layers[name].renderTarget);
        }

        //unregister window listeners
        window.removeEventListener('resize', onWindowResize);
    };

    this.$onPostUpdate = function(deltaTime) {
        //have renderable instances update their position/rotation by normalizing
        //transform position to canvas position - in the process, cull objects
        //by toggling visibility
        engine.broadcast('pixi.transform');

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

        if (!renderable) { return; }

        var pixiDisplayObject = renderable.getDisplayObject(true);

        //add to stage for the layer
        self.getLayer(renderable.layer).stage.addChild(pixiDisplayObject);
    };

    /**
     * Removes renderable prefab hierarchy from the layer when destroyed.
     */
    this.$onPrefabDestroy = function(prefab) {
        var renderable = prefab.get('pixi.renderable');
        if (!renderable) { return; }

        var pixiDisplayObject = renderable.getDisplayObject(true);

        self.getLayer(renderable.layer).stage.removeChild(pixiDisplayObject);
    };

    /**
     * If the window is resized, recheck the render target and resize
     * the renderers in each layer.
     */
    function onWindowResize() {
        var targetStyle = window.getComputedStyle(renderTarget);
        var targetHeight = targetStyle.height;
        var targetWidth = targetStyle.width;

        for (var name in layers) {
            layers[name].renderer.resize(targetWidth, targetHeight);
        }
    }

});
