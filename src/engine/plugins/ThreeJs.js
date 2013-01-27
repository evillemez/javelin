/*global Javelin:true */

'use strict';

Javelin.Plugin.ThreeJs = function(engine, config, plugin) {
    plugin.config = config;
    plugin.scene = {};
    
    plugin.init = function() {
        
    };
    
    plugin.onGameObjectDestroy = function(go) {
        var c = go.getComponent('transform3d');
        if (c) {
            
        }
    };
    
    plugin.onGameObjectCreate = function(go) {
        var c = go.getComponent('transform3d');
        if (c) {
            
        }
    };
    
    plugin.step = function(deltaTime) {
        if (deltaTime >= 1000/config.stepsPerSecond) {
            for (var go in engine.gos) {
                if(go.active) {
                    //todo...something
                }
            }
        }
    };
};