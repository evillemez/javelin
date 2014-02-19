# Coordinate Demo #

This demo allows you to control the circle on the screen, as well as the camera being used
to draw the layer.  Game coordinates are not pixel coordinates - always keep this in mind. By
using a different coordinate system, it is easier to integrate with other systems that know
nothing about pixels, but do need to know where things are located, in particular physics engines.
In addition, it makes it easier to develop resolution independent games, which is particularly 
important if your game is intended to run on a variety of devices.

Some things to keep in mind about the coordinate system:

* Point `0, 0` by default is the center of the viewport.
* How many pixels per unit is configurable per layer, the default is `20`.

## Controls ##

* &uarr;, &darr;, &larr;, &rarr; to control movement of the circle
* `w,a,s,d` to control directional movement of the camera
* `e` to zoom camera in
* `q` to zoom camera out
