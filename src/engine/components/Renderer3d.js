'use strict';

Javelin.Component.Renderer3d = function(go, comp) {
    var t = go.getComponent('transform3d');
    
    //initialize requirements
    comp.material = {};
    comp.geometry = {};
    comp.mesh = {};
    
    //note that if you change the material/geometry, you must
    //call getMesh() to actually change the mesh
    comp.getMesh = function() {
        comp.mesh = new THREE.mesh(comp.geometry, comp.material);
        comp.mesh.useQuaternion = true;
        return comp.mesh;
    };
};
Javelin.Component.Renderer3d.alias = 'renderer3d';
Javelin.Component.Renderer3d.requires = [
    Javelin.Component.Transform3d
];
//Javelin.register(Javelin.Component.Renderer3d);
