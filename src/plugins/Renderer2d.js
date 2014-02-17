/**
 * Renderer2d provides an API to components for drawing paths and images to HTML5 canvas.
 * It also handles multiple layers, with configurable render modes per layer.
 */
Javelin.Plugins.Renderer2d = function(config) {
    var self = this;

    this.config = config;
    
    this.renderTarget = null;
    this.cameras = {};
    this.contexts = {};
    this.canvases = {};

    var engine = this.$engine;
    
    this.$onLoad = function() {
        //only active in the browser
        if (!document) {
            self.$active = false;
            return;
        }
            
        self.fps = self.config.framesPerSecond || engine.stepsPerSecond;
        self.lastTimeRendered = 0.0;
        var target = document.getElementById(self.config.renderTargetId);
        self.renderTarget = target;
        var top = target.offsetTop;
        var left = target.offsetLeft;
        
        if (!target) {
            throw new Error("No render target defined!");
        }
        
        if (!self.config.layers) {
            self.config.layers = ['default'];
        }
        
        //create and stack canvas layers
        var z = 0;
        for (var i in self.config.layers) {
            z++;
            var layer = self.config.layers[i];
            var canvas = document.createElement('canvas');
            canvas.height = self.config.height;
            canvas.width = self.config.width;
            canvas.style.zIndex = z;
            canvas.id = 'javelin-layer-' + layer;
            
            self.canvases[layer] = canvas;
            self.contexts[layer] = canvas.getContext('2d');
            self.cameras[layer] = {
                x: 0,
                y: 0,
                height: 0,
                width: 0
            };
            
            target.appendChild(canvas);
        }
    };
    
    this.$onUnload = function() {
        for (var i in self.canvases) {
            self.renderTarget.removeChild(self.canvases[i]);
        }
    };
    
    this.$onPostUpdateStep = function(deltaTime) {
        if (engine.time - self.lastTimeRendered >= self.fps && !engine.isRunningSlowly) {
            var i, j, ctx, canvas, camera;
            
            //clear all canvases
            for (i in self.canvases) {
                self.contexts[i].clearRect(0, 0, self.canvases[i].width, self.canvases[i].height);
            }

            //execute `canvas2d.draw` callbacks on all root game objects (by layer)
            //NOTE: right now, the layer of the root game object filters to children
            var gos = engine.gos;
            var l = gos.length;
            for (i = 0; i < l; i++) {
                if (gos[i].enabled && gos[i].isRoot()) {
                    //get layer
                    ctx = self.contexts[gos[i].layer];
                    camera = self.cameras[gos[i].layer];
                    //check for a draw callbacks to run
                    var cbs = gos[i].getCallbacks('renderer2d.draw', true);
                    for (j in cbs) {
                        cbs[j](ctx, camera);
                    }
                }
            }
            
            self.lastTimeRendered = engine.time;
        }
    };
};
