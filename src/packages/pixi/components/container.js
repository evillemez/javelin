/*global PIXI: true */

/**
 * This is for use with non-visislbe entities that contain renderable children. It simply
 * provides an empty container that child display objects can be added into.
 */
javelin.component('pixi.container', ['pixi.renderable'], function(entity, engine) {
    var self = this;

    entity.on('entity.create', function() {
        entity.get('pixi.renderable').setDisplayObject(new PIXI.DisplayObjectContainer());
    });

});
