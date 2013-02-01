"use strict";

//setup game namespace
var Playground = Playground || {};
Playground.prefabs = {};

Playground.scene = {
    name: "Test Scene",
    plugins: {
        "threejs": {
            renderer: {
                type: "webgl",
                element: $('#viewport')
            }
            ,useQuaternions: true
            ,stepsPerSecond: 60
        }
    },
    objects: [
        {
            name: "Obj1",
            components: {
                "transform3d": {},
                "playground.rotator": {
                    speed: 1
                }
            }
        }
    ]
};

//on document ready
$(function() {
    
    //configure engine
    var engineConfig = {
        debug: true
        plugins: [
            Javelin.Plugin.ThreeJs
            //,Javelin.Plugin.CannonJs
            //,Javelin.Plugin.Input
            //,Javelin.Plugin.Network
        ],
        options: {
            "threejs": {
                renderer: {
                    element: $("#viewport")
                }
            }
        }
    };
    
    //instantiate engine
    var engine = new Javelin.Engine(Javelin.Environment.Browser, engineConfig);
    engine.initialize(); //one-time setup
        
    //once the engine sets up the scene, tell the browser
    //to start running the game
    engine.loadScene(Playground.scene, function() {
        engine.run();
    });
});
