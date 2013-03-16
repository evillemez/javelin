# TODO #

The general TODO list for various subsystems and what not.  Testing doesn't get a bullet point - it's assumed as everything under `src/javelin/engine/` needs to be tested as thoroughly as it can be.

**The short list:**

* more Javelin tests for resolving inheritence and requirements
* Tiled map loading
* player input component
* box2d component

## Near-term ##

Things that I'll be working on in the near-term, organized by category.

### General ###

* implement a default *loading* scene, easily overwritten by game config
    * actually treat it like any other scene

### Core ###

Some items related to the core code in `src/javelin/engine`.

### Engine ###

* implement pre/post update plugin loops - a plugin should specify where it belongs
* implement engine-level event dispatching
* load requiredAssets before calling scene load callback

### Environments ###

* finalize the api, figure out the relationship between the environments, and asset loading

### Game Object ###

* implement tag system
* implement layers
* implement GO-level event dispatching (emit up, broadcast down)
    * difference between component-level callback and GO-level event:
        * Component callback - potentiall unique API per callback, most likely called by an engine plugin, it 
        will have to document the necessary format for the callback
        * GO event - standard api for listeners, probably same as engine-level event system

### Plugins ###

* Player input
* Box2d

### Canvas2d Plugin ###

* implement layers for multiple canvases

### Assets ###

* TiledMap asset

### Components ###

* TiledMapEnvironment ?

## Long-term features ##

* more plugins to support different types of games:
    * network plugin for syncing clients for multiplayer
    * three.js for 3d rendering
    * cannon.js for 3d physics sim
