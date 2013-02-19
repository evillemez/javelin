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
                ctx.drawImage(s.image, pos.x, pos.y);
            }
        }
    };
};

Javelin.Plugin.Canvas2d.alias = "canvas2d";
Javelin.registerPlugin(Javelin.Plugin.Canvas2d);
