'use strict';

Javelin.Component.Rigidbody3d = function(go, comp) {
    var t = go.getComponent('transform3d');
    
    //rigidbody in cannon will be known as "collider"
    //comp.collider = ....
};
Javelin.Component.Rigidbody3d.alias = "rigidbody3d";
Javelin.Component.Rigidbody3d.requires = [
    Javelin.Component.Transform3d
];
//Javelin.register(Javelin.Component.Rigidbody3d);