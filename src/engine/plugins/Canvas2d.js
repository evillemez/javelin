/*global Javelin:true */

'use strict';

/**
 * Canvas2d draws sprite components for 2d scenes.
 */
Javelin.Plugin.Canvas2d = function(engine, plugin, config) {
    plugin.engine = engine;
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
    };
    
    plugin.$step = function(deltaTime) {
        //TODO: check $config.framesPerSecond

        var ctx = this.context;
        var canvas = this.config.canvas;
        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        //loop over gos and draw any sprite components
        var gos = this.engine.gos.length;
        var l = gos.length;
        for (var i = 0; i < l; i++) {
            var s = gos[i].getComponent('sprite');
            if (s) {
                var pos = gos[i].getComponent('transform2d').position;
                ctx.drawImage(s.image, pos.x, pos.y);
            }
        }
    };
};

Javelin.Plugin.Canvas2d.alias = "canvas2d";
Javelin.Plugin.Canvas2d.defaults = {
    
};
