'use strict';

Javelin.Component.Sprite = function(go, comp) {
    
    comp.image = null;
    
    comp.size = {
        x: 100,
        y: 100
    };
    
    //TODO: figure out what else can be done with a simple image and canvas
};
Javelin.Component.Sprite.alias = "sprite";
Javelin.Component.Sprite.requires = [
    Javelin.Component.Transform2d
];
//Javelin.register(Javelin.Component.Sprite);
