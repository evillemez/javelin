# TODO #

* implement autoregistration of components/prefabs/scenes if given a starting point
    * change `Javelin.register` to `registerComponent`
* (TEST) implement go create/delete buffers for when engine is updating
* implement cascading enable/disable, boolean `enabled`, change `active`
* implement go.setId(), id should cascade to all components
* `GameObject.addComponent` should be implemented by calling the engine: `engine.addComponent(go, 'transform2d', true)`
    * also, `engine.removeComponent(go, 'transform2d')`
* test go hierarchy stuff
* implement Plugins and plugin registry the same way as gameobject components
    * add `Javelin.registerPlugin`
* properly implement `engine.updating` boolean
    * don't allow the go array to be modified during a loop
    * new gos should be added to a temp location and merged in at end of game step
    * removed gos should be removed after updates are completed
    
