"use strict";

Playground.scene = {
    alias: "",
    assets: {
        
    },
    environment: {
        "browser": {
            streamAssets = true
        },
        "server": {
            maxConnections: 30
        }
    }
    plugins: {
        "three": {
            renderer: "webgl"
            ,renderTarget: $('#game')
            ,useQuaternions: true
            ,stepsPerSecond: 60
        },
        "cannon" {
            stepsPerSecond: 30
            ,foo: 'bar'
        },
        "network": {
            server: "http://localhost:1337"
            ,style: 'snapshot'
            ,syncsPerSecond: 10
        }
    },
    objects: [
        {
            name: "Obj 1",
            components: {
                "transform": {
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
