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
    var plugin = engine.getPlugin('pixi');
    var renderable = entity.get('pixi.renderable');

    //define sprite - unfortunately need to provide an empty texture until
    //we can be sure that the underlying resource has loaded
    var sprite = new PIXI.Sprite(plugin.emptyTexture);
    sprite.visible = false;

    //register assets to load
    entity.on('assets.require', function(loader) {
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
            // baseTexture.source = assets[self.imagePath];
            // baseTexture.hasLoaded = true;
            sprite.setTexture(new PIXI.Texture(assets[self.imagePath]));
        }
    
        sprite.visible = true;
    });

    entity.on('entity.create', function() {
        renderable.setDisplayObject(sprite);
    });
});
