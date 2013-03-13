/*global Javelin:true */

'use strict';

/**
 * Canvas2d draws sprite components for 2d scenes.
 */
Javelin.Plugin.Canvas2d = function(plugin, config) {
    plugin.config = config;
    
    plugin.$onLoad = function() {
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
    
    plugin.$onStep = function(deltaTime) {
        
        if (plugin.$engine.time - plugin.lastTimeRendered >= plugin.fps && !plugin.$engine.isRunningSlowly) {
            var ctx = plugin.context;
            var canvas = plugin.canvas;

            //clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            //loop over gos and draw any sprite components
            var gos = plugin.$engine.gos;
            var l = gos.length;
            for (var i = 0; i < l; i++) {
                var s = gos[i].getComponent('sprite');
                if (s && s.visible && s.image) {
                    var pos = gos[i].getComponent('transform2d').position;
                    var rot = gos[i].getComponent('transform2d').rotation;

                    //TODO: implement rotation (http://stackoverflow.com/questions/3793397/html5-canvas-drawimage-with-at-an-angle)

                    if (s.image instanceof Javelin.Asset.AtlasImage) {
                        var spr = s.image;
                        ctx.drawImage(spr.image, spr.x, spr.y, spr.width, spr.height, pos.x + spr.cx, pos.y + spr.cy, spr.width, spr.height);
                    } else {
                        ctx.drawImage(s.image, pos.x, pos.y);
                    }
                }
            }
            
            plugin.lastTimeRendered = plugin.$engine.time;
        }
    };
};
Javelin.Plugin.Canvas2d.alias = "canvas2d";
