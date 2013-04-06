/*global Javelin:true */

'use strict';

/**
 * Canvas2d draws sprite components for 2d scenes.
 */
Javelin.Plugin.Canvas2d = function(plugin, config) {
    plugin.config = config;
    
    //todo, implement
    plugin.viewport = {
        x: 0.0,
        y: 0.0
    };
    
    plugin.$onLoad = function() {
        if (document) {
            plugin.fps = plugin.config.framesPerSecond || plugin.$engine.stepsPerSecond;
            plugin.lastTimeRendered = 0.0;        
            var target = document.getElementById(plugin.config.renderTargetId);
            if (!target) {
                throw new Error("No render target defined!");
            }
            var canvas = document.createElement('canvas');
            plugin.canvas = canvas;
            plugin.context = canvas.getContext('2d');
            plugin.canvas.height = plugin.config.height;
            plugin.canvas.width = plugin.config.width;
            target.appendChild(canvas);
        }
        
        //TODO: implement layers, create canvas(es) internally
    };
    
    plugin.$onGameObjectDestroy = function(go) {
        
    };
    
    plugin.$onGameObjectCreate = function(go) {
        var sprite = go.getComponent('sprite');
        if (sprite) {
            sprite.visible = true;
        }
    };
    
    plugin.$onPostUpdateStep = function(deltaTime) {
        if (plugin.$engine.time - plugin.lastTimeRendered >= plugin.fps && !plugin.$engine.isRunningSlowly) {
            var ctx = plugin.context;
            var canvas = plugin.canvas;

            //clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            //loop over gos and draw any sprite components, and execute any `canvas2d.draw` callbacks
            var gos = plugin.$engine.gos;
            var l = gos.length;
            for (var i = 0; i < l; i++) {
                
                //check for a draw callback to run
                var cbs = gos[i].getCallbacks('canvas2d.draw');
                for (var j in cbs) {
                    cbs[j](ctx);
                }

            }
            
            plugin.lastTimeRendered = plugin.$engine.time;
        }
    };
};
Javelin.Plugin.Canvas2d.alias = "canvas2d";
