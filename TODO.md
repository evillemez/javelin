# TODO #

The general TODO list for various subsystems and what not.  Testing doesn't get a bullet point, it's assumed as everything under `src/engine/javelin/` needs to be tested thoroughly.

## General ##

* update `README` now that direction/implementation is considerably more clear
* implement a default *loading* scene, easily overwritten by game config
    * actually treat it like any other scene

## Javelin ##

* Javelin.unpackPrefabDefinitions - allow it to uncompress prefab references in children, then you can mixmatch string/obj
definitions in a prefab, without the overhead of type checking upon instantiation
    * call during instantiation
* change `Javelin.register` to `registerComponent`
* implement auto-initialize self constant (during init, registers built-in Javelin objects automatically)

## Engine ##

* move component creation out of `GameObject` and into `Engine`
    * reorganize tests accordingly
    * make sure create/destroy execute in proper time (not during engine update)
    * implement autoregistration of components/prefabs/scenes if given a starting point
* implement proper plugin initialization upon scene load
* implement engine-level event dispatching
* pass array of strings to engine, can be overwritten by scene in `plugins` field
    * load handler by string from `Javelin.registerPlugin` calls
    * definition order determines call-order during update
* during initialize load plugins defined in game as defaults, store the default setting
* `Engine.loadScene` should take a string as an argument

## Engine Environment ##

* finalize and test API, right now it's only responsible for implementing `engine.run()`

## Engine Plugin ##

* plugin initialization
* finalize config API for plugins

## Game Object ##

* implement GO-level event dispatching (emit up, broadcast down)
    * difference between component-level callback and GO-level event:
        * Component callback - potentiall unique API per callback, most likely called by an engine plugin, it 
        will have to document the necessary format for the callback
        * GO event - standard api for listeners, probably same as engine-level event system
* `GameObject.addComponent` should be implemented by calling the engine: `engine.addComponent(go, 'transform2d', true)`
* Implement GO hierarchy functionality (parent/child relationships)

## GO Component ##

* GO Component IDs should be incrementing integers

## Canvas2d Plugin ##

* actual canvases should be created internally using a css selector reference, must be done this way because
there will be a need for multiple canvas instances, and that has to be dynamic