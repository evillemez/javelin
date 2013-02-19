"use strict";

//setup game namespace
var Grits = Grits || {};
Grits.Prefab = {
    Robot: {
        name: "Robot",
        components: {
            "grits.robot": {},
        }
    }
};

Grits.scene = {
    name: "Test Scene",
    objects: [
        {
            name: "Robot Manager",
            components: {
                "grits.robot_manager": {}
            }
        },
    ]
};

//on document ready
$(document).ready(function() {
    
    //configure engine
    var engineConfig = {
        debug: true,
        plugins: [
            Javelin.Plugin.Canvas2d
        ],
        loader: {
            assetUrl: "https://www.udacity.com/"
        },
        options: {
            "canvas2d": {
                canvas: document.getElementById('game'),
                height: 600,
                width: 800,
                framesPerSecond: 1000/30
            }
        }
    };

    //instantiate engine
    var engine = new Javelin.Engine(new Javelin.Environment.Browser(), engineConfig);
    //one-time setup to register components
    engine.initialize();
        
    //once the engine sets up the scene, tell the browser
    //to start running the game
    engine.loadScene(Grits.scene, function() {
        engine.run();
    });
});
