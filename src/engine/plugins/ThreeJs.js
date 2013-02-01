/*global Javelin:true */

'use strict';

Javelin.Plugin.ThreeJs = function(engine, plugin, config) {
    plugin.config = config;
    plugin.scene = {};
    plugin.renderer = {};
    plugin.activeCamera = {};
    
    plugin.$initialize = function() {
        plugin.$reset();
    };
    
    plugin.$reset = function() {
        //clear the scene
        plugin.scene = new THREE.Scene();

        //figure out renderer based on config
        plugin.renderer = new THREE.WebGLRenderer();
        if (plugin.config.renderer.element) {
            plugin.renderer.setSize(plugin.config.renderer.element.innerWidth, plugin.config.renderer.element.innerHeight);
        } else {
            plugin.renderer.setSize(plugin.config.renderer.width, plugin.config.renderer.height);
        }
        
        //setup "main" camera
        //manually great game object for camera, with camera component, whatever that means
        //and add to engine
        plugin.activeCamera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
        plugin.activeCamera.position.z = 5;
    };
    
    plugin.$loadScene = function(sceneDef) {
        //first: merge config, then reset
        plugin.$reset();
    };
    
    plugin.$onGameObjectDestroy = function(go) {
        var c = go.getComponent('renderer3d');
        if (c) {
            plugin.scene.remove(c.mesh);
        }
    };
    
    plugin.$onGameObjectCreate = function(go) {
        var c = go.getComponent('renderer3d');
        if (c) {
            plugin.scene.add(c.getMesh());
        }
    };
    
    plugin.$step = function(deltaTime) {
        var gos = engine.gos;
        if (deltaTime >= 1000/plugin.config.stepsPerSecond) {
            for (var i = 0; i < gos.length; i++) {
                var c = gos[i].getComponent('renderer3d') || false;
                if(c) {
                    if(gos[i].active) {
                        //update position/rotation data
                        c.mesh.visible = true;
                        c.mesh.position = gos[i].components["transform3d"].position;
                        c.mesh.rotation = gos[i].components["transform3d"].rotation;
                    } else {
                        c.mesh.visible = false;
                    }
                }
            }
            
            //render frame
            plugin.renderer.render(plugin.scene, plugin.activeCamera);
        }
    };
    
    //public api
    plugin.useCamera = function(name) {
        //switch active camera
    };
};

Javelin.Plugin.ThreeJs.alias = "threejs";
Javelin.Plugin.ThreeJs.defaults = {
    renderer: {
        type: "webgl",
        height: 600,
        width: 800,
        element: null
    },
    
};
