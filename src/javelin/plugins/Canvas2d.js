/*global Javelin:true */

'use strict';

/**
 * Canvas2d draws sprite components for 2d scenes.
 */
Javelin.Plugin.Canvas2d = function(plugin, config) {
    plugin.$config = config;
    
    plugin.$initialize = function() {
        plugin.$reset();
    };
    
    plugin.$reset = function() {
        plugin.context = plugin.$config.canvas.getContext('2d');
        plugin.$config.canvas.height = plugin.$config.height;
        plugin.$config.canvas.width = plugin.$config.width;
        
        //TODO: implement layers, create canvas(es) internally
    };
    
    plugin.$loadScene = function(sceneDef) {
        //first: merge config, then reset
        plugin.$reset();
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
        //TODO: check $config.framesPerSecond

        var ctx = plugin.context;
        var canvas = plugin.$config.canvas;

        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        //loop over gos and draw any sprite components
        var gos = this.$engine.gos;
        var l = gos.length;
        for (var i = 0; i < l; i++) {
            var s = gos[i].getComponent('sprite');
            if (s && s.visible && s.image) {
                var pos = gos[i].getComponent('transform2d').position;
                var rot = gos[i].getComponent('transform2d').rotation;

                //TODO: implement rotation (http://stackoverflow.com/questions/3793397/html5-canvas-drawimage-with-at-an-angle)

                if (s.image instanceof Javelin.Asset.AtlasImage) {
                    var spr = s.image;
                    ctx.drawImage(spr.image, pos.x, pos.y, spr.width, spr.height, pos.x + spr.cx, pos.y + spr.cy, spr.width, spr.height);
                } else {
                    ctx.drawImage(s.image, pos.x, pos.y);
                }
            }
        }
    };
};

Javelin.Plugin.Canvas2d.alias = "canvas2d";
Javelin.registerPlugin(Javelin.Plugin.Canvas2d);
