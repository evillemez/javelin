'use strict';

Playground.Rotator = function(go, component) {
    
    /* Component Requirements must be assigned to (this) */
    this.name = "playground.rotator";
    this.requires = [
        Javelin.Component.Transform3d,
        Javelin.Component.Rigidbody
    ];
    this.inherits = Playground.Base;
    
    /* Component exports (essentially the public API for the component) */
    
    //set up values we care about, these are effectively "public", which means they
    //can be stored/saved/set in external configuration
    component.speed = 5;
    
    //set up internal values, effectively "private"
    var rotation = go.getComponent('transform').rotation;
    
    //componentine update callback (private)
    var update = function(deltaTime) {
        rotation += component.speed * deltaTime;
    };
    
    //register callbacks on the game object for engine plugins to process
    component.$on('update', update);
};


//example export of this via would be:
/*

{
    "components": {
        "playground.rotator": {
            "speed": 5
        }
    }
}

*/