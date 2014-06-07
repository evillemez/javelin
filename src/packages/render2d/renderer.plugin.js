/* global Layer2dCamera, Layer2dCanvas */

/**
 * Renderer2d provides an API to components for drawing paths and images to HTML5 canvas.
 * It also handles multiple layers, with configurable render modes per layer.
 *
 * TODO: document config, including layers and cameras
 */
javelin.plugin('renderer2d', function(config) {
    
    var self = this;
    var renderTarget = null;
    var cameras = {};
    var layers = {};
    var layerRenderTargets = {};
    var engine = this.$engine;
    var lastTimeRendered;
    var targetFps = 30;

    /**
     * Get a camera instance by name.
     *
     * @param  {string} name            Name of camera to get.
     *
     * @return {Layer2dCamera}  The camera instance
     */
    this.getCamera = function (name) {
        if (!cameras[name]) {
            throw new Error("Unknown camera ["+name+"] requested.");
        }

        return cameras[name];
    };

    /**
     * Get a layer instance by name.  Currently only Canvas2dRenderLayers
     * are supported, but in the future there may be other types of layer
     * renderers.
     *
     * @param  {string} name            Name of layer to get.
     *
     * @return {Canvas2dRenderer}  The layer instance
     */
    this.getLayer = function(name) {
        if (!layers[name]) {
            throw new Error("Unknown layer ["+name+"] requested.");
        }

        return layers[name];
    };

    /**
     * Load creates layer and camera instances based on given config.  If config
     * does not specify anything, there is always a 'default' layer, and a 
     * 'default' camera.
     */
    this.$onLoad = function() {
        //only active in the browser
        if (!document || !window) {
            self.$active = false;
            console.log("No browser environment detected - deactivating the renderer2d plugin.");
            return;
        }
            
        targetFps = config.framesPerSecond || engine.stepsPerSecond;
        lastTimeRendered = 0.0;

        var target = document.getElementById(config.renderTargetId);
        renderTarget = target;
        
        if (!target) {
            throw new Error("No render target defined!");
        }
        
        //enforce default layer
        config.layers = config.layers || {};
        if (!config.layers['default']) {
            config.layers['default'] = {
                renderer: 'canvas2d',
                camera: 'default',
                clearOnUpdate: true,
                config: {
                    pixelsPerUnit: 20
                }
            };
        }

        //enforce default camera
        config.cameras = config.cameras || {};
        if (!config.cameras['default']) {
            config.cameras['default'] = {};
        }
        
        //create cameras
        for (var cameraName in config.cameras) {
            cameras[cameraName] = new Layer2dCamera(cameraName, config.cameras[cameraName]);
        }
        
        //create and stack layer containers
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
            // layerRenderTarget.style.top = top;
            // layerRenderTarget.style.left = left;
            layerRenderTarget.id = 'javelin-layer-' + layerName;
            layerRenderTargets[layerName] = layerRenderTarget;
            target.appendChild(layerRenderTarget);

            //instantiate layer with render target
            var layerInstance = createLayerInstance(
                layerRenderTarget,
                self.getCamera(layerConfig.camera || 'default'),
                layerConfig.config
            );

            layers[layerName] = layerInstance;
        }
    };
    
    /**
     * Unload will remove any created layerRenderTargets.
     */
    this.$onUnload = function() {
        for (var name in layerRenderTargets) {
            renderTarget.removeChild(layerRenderTargets[name]);
        }

        //drop internally created objects
        layerRenderTargets = {};
        layers = {};
        cameras = {};
    };
    
    /**
     * PostUpdate will call all available `renderer2d.draw` callbacks registered
     * by entity components, passing along the relevant layer instance and camera.
     */
    this.$onPostUpdate = function(deltaTime) {
        if (engine.isRunningSlowly || engine.time - lastTimeRendered <= targetFps) {
            console.log("skipping frame");
            return;
        }

        var i, j;

        //clear all layers
        for (var layerName in config.layers) {
            if (config.layers[layerName].clearOnUpdate) {
                layers[layerName].clear();
            }
        }

        //execute `renderer2d.draw` callbacks on all root game objects (by layer)
        var entities = engine.gos;
        var li = entities.length;
        for (i = 0; i < li; i++) {
            if (entities[i].enabled && entities[i].isRoot()) {
                var layer = self.getLayer(entities[i].layer);
                var camera = layer.getCamera();
                this.$engine.broadcast('renderer2d.draw', [layer, camera]);
            }
        }
        
        lastTimeRendered = engine.time;
    };

    var createLayerInstance = function(layerRenderTarget, camera, layerConfig) {
        //one day, this could return different types of
        //render layers
        return new Layer2dCanvas(layerRenderTarget, camera, layerConfig);
    };
});
