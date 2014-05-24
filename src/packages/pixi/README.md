# Pixi.js Plugin #

This package provides a plugin that uses the pixi.js library to provide flexible 2d rendering.

The pixi plugin interacts with a base `renderable` component, which other components extend for specific types
of renderable objects.

The plugin also adds a layer on top of the typical pixi.js *stage*, to allow using a cartesian coordinates, as well
as rendering all objects relative to a "camera".  This makes it easier to develop resolution independent games, and
keeps a unified coordinate system consistent accross other plugins, for example: physics.


## Renderables ##


Pixi:

* Sprite
* MovieClip
* Graphics
* DisplayObjectContainer


Javelin:

* Sprite
* Polygon