# TODO #

* implement go.setId(), id should cascade to all components
* test go hierarchy stuff
* implement Plugins and plugin registry the same way as gameobject components
    * add `Javelin.registerPlugin`
* properly implement `engine.updating` boolean
    * don't allow the go array to be modified during a loop
    * new gos should be added to a temp location and merged in at end of game step
    * removed gos should be removed after updates are completed
    
