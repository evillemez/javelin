'use strict';

/**
 * This class represents a specific image in a sprite sheet exported from TexturePacker.  This is used internally
 * in the TexturePackerAtlas class.  The values here assume that the data was exported by TexturePacker in
 * the "json(hash)" format
 */
Javelin.Asset.AtlasImage = function(data, image) {
    this.image = image;
    this.x = data.frame.x;
    this.y = data.frame.y;
    this.height = data.frame.h;
    this.width = data.frame.w;

    if (data.trimmed) {
        this.cx = data.spriteSourceSize.x - data.sourceSize.w * 0.5;
        this.cy = data.spriteSourceSize.y - data.sourceSize.h * 0.5;
    } else {
        this.cx = -this.width * 0.5;
        this.cy = -this.height * 0.5;
    }
};
