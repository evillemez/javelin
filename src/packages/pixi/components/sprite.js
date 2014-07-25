/*global PIXI: true */

/**
 * Pixi sprite wrapper component.
 *
 * @apidoc packages.pixi.component.sprite.html
 * @type component
 */
javelin.component('pixi.sprite', ['pixi.renderable', 'common.loader'], function(entity, engine) {

    //publicly configurable properties
    this.imagePath = null;
    this.atlasPath = null;

    var self = this;
    var renderable = entity.get('pixi.renderable');
    var loader = entity.get('common.loader');

    //define sprite
    var baseTexture = new PIXI.BaseTexture();
    var sprite = new PIXI.Sprite(new PIXI.Texture(baseTexture));
    sprite.visible = false;

    //register assets to load
    entity.on('assets.load', function(loader) {
        if (self.atlasPath) {
            loader.requireAsset(self.atlasPath);
        } else if (self.imagePath) {
            loader.requireAsset(self.imagePath);
        }
    });

    //set sprite texture and show it once loaded
    entity.on('assets.loaded', function(assets) {
        if (self.atlasPath) {
            //TODO: create texture from atlas
        } else if (self.imagePath) {
            baseTexture.source = assets[self.imagePath];
            baseTexture.hasLoaded = true;
        }
    
        sprite.visible = true;
    });

    entity.on('entity.create', function() {
        
        //HACK - don't want pixi to have to load stuff...
        var sprite = new PIXI.Sprite(new PIXI.Texture.fromImage(self.imagePath));

        renderable.setDisplayObject(sprite);
    });
});
