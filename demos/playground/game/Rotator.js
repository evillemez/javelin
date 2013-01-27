'use strict';

//example component builder
Playground.RotatorComponent = function(go, component) {
    
    /* Component exports (essentially the public API for the component) */
    
    //set up values we care about, these are effectively "public", which means they
    //can be stored/saved/set in external configuration
    component.speed = 5;
    
    //set up internal values, effectively "private"
    var rotation = go.getComponent('transform').rotation;
    
    //register callbacks on the game object for engine plugins to process
    component.$on('update', function(deltaTime) {
        rotation += component.speed * deltaTime;
    });
};

//example component meta (name is required)
Playground.Rotator.alias = "playground.rotator";
//Playground.Rotator.inherits = Playground.BaseComponent;
Playground.Rotator.requires = [
    Javelin.Component.Transform3d
    ,Javelin.Component.Rigidbody
];
