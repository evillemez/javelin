# TODO #

* implement go callback cache
    * invalidate cache when:
        * component.$on() calls
        * add/remove components also
        * parent/unparent 
    * cache includes children (optionally?)
* implement `engine.updating` boolean
    * don't allow the go array to be modified during a loop
    * new gos should be added to a temp location and merged in at end of game step
    * removed gos should be removed after updates are completed