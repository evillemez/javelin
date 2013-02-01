"use strict";

Playground.scene = {
    alias: "Demo Scene",
    assets: {
        
    },
    environment: {
        "browser": {
            streamAssets = true
        },
        "server": {
            maxConnections: 30
        }
    },
    plugins: {
        "three": {
            renderer: "webgl"
            ,renderTarget: $('#viewport')
            ,useQuaternions: true
            ,stepsPerSecond: 60
        }
    },
    objects: [
        {
            name: "Obj 1",
            components: {
                "transform3d": {
                    position: {
                        x: 5.3,
                        y: 1.1,
                        z: 2.2
                    },
                    rotation: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                },
                "renderer3d": {
                    
                },
                "playground.rotator": {
                    speed: 4
                }
            }
        },
        {
            name: "Obj 2",
            components: {
                
            }
        }
    ]
}
