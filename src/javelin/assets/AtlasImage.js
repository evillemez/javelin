'use strict';

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
        this.cx = -this.w * 0.5;
        this.cy = -this.h * 0.5;
    }
};
