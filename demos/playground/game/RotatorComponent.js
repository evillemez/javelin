'use strict';

//example component builder
Playground.RotatorComponent = function(go, component) {
    
    /* Component exports (essentially the public API for the component) */
    
    //set up values we care about, these are effectively "public", which means they
    //can be stored/saved/set in external configuration
    component.speed = 5;
    
    //set up internal values, effectively "private"
    var rotX = go.getComponent('transform').rotation.x;
    
    //register callbacks on the game object for engine plugins to process
    component.$on('update', function(deltaTime) {
        rotX += component.speed * deltaTime;
    });
};

//component meta
Playground.RotatorComponent.alias = 'playground.rotator';
Playground.RotatorComponent.requires = [
    Javelin.Component.Transform3d
    ,Javelin.Component.Rigidbody
];

//register
Javelin.register(Playground.RotatorComponent);
