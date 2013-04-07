/*global Javelin:true */

'use strict';

/**
 * Canvas2d draws sprite components for 2d scenes.
 */
Javelin.Plugin.Canvas2d = function(plugin, config) {
    plugin.config = config;
    
    plugin.cameras = {};
    plugin.contexts = {};
    plugin.canvases = {};
    
    plugin.$onLoad = function() {
        if (document) {
            
            plugin.fps = plugin.config.framesPerSecond || plugin.$engine.stepsPerSecond;
            plugin.lastTimeRendered = 0.0;        
            var target = document.getElementById(plugin.config.renderTargetId);
            var top = target.offsetTop;
            var left = target.offsetLeft;
            
            if (!target) {
                throw new Error("No render target defined!");
            }
            
            if (!plugin.config.layers) {
                plugin.config.layers = ['default'];
            }
            
            //create and stack canvas layers
            var z = 0;
            for (var i in plugin.config.layers) {
                z++;
                var layer = plugin.config.layers[i];
                var canvas = document.createElement('canvas');
                canvas.height = plugin.config.height;
                canvas.width = plugin.config.width;
                canvas.style.position = 'absolute';
                canvas.style.top = top;
                canvas.style.left = left;
                canvas.style.zIndex = z;
                canvas.id = 'javelin-layer-' + layer;
                
                plugin.canvases[layer] = canvas;
                plugin.contexts[layer] = canvas.getContext('2d');
                plugin.cameras[layer] = {
                    x: 0,
                    y: 0,
                    height: 0,
                    width: 0
                };
                
                target.appendChild(canvas);
            }
        } else {
            plugin.$active = false;
        }
    };
    
    plugin.$onPostUpdateStep = function(deltaTime) {
        if (plugin.$engine.time - plugin.lastTimeRendered >= plugin.fps && !plugin.$engine.isRunningSlowly) {
            var i, j, ctx, canvas, camera;
            
            //clear all canvases
            for (i in plugin.canvases) {
                plugin.contexts[i].clearRect(0, 0, plugin.canvases[i].width, plugin.canvases[i].height);
            }

            //execute `canvas2d.draw` callbacks on all root game objects (by layer)
            //NOTE: right now, the layer of the root game object filters to children
            var gos = plugin.$engine.gos;
            var l = gos.length;
            for (i = 0; i < l; i++) {
                if (gos[i].isRoot()) {
                    //get layer
                    ctx = plugin.contexts[gos[i].layer];
                    camera = plugin.cameras[gos[i].layer];
                    //check for a draw callbacks to run
                    var cbs = gos[i].getCallbacks('canvas2d.draw', true);
                    for (j in cbs) {
                        cbs[j](ctx, camera);
                    }
                }
            }
            
            plugin.lastTimeRendered = plugin.$engine.time;
        }
    };
};
Javelin.Plugin.Canvas2d.alias = "canvas2d";
