javelin.component('audioEmitter2d', ['transform2d'], function(entity, game) {
    var self = this;
    var audio = null,
        transform = null, 
        outputNode = null;
        
    var filterNodes = {};
    
    //public config values
    this.spatial = true; //if true, culling and filters can be applied - if not true, it connects directly to the audio plugins masterVolumeNode
    this.range = 50;
    this.volume = 100;
    this.getAudioNode = function() {};
    
    var activeLoops = {};
    
    /**
     * Play a sound continually, given the path to the sound.
     * 
     * @param {String} path Path to audio file asset
     * @param {Boolean} cull Flag to NOT play the sound if won't actually be heard by the audioListener.  By default is `false` - generally should only be used for short-lived sounds like gunshots or explosions.
     */    
    this.playLoop = function(path, cull) {
        cull = cull || false;
        
        if (!activeLoops[path]) {
            activeLoops[path] = true;
            //start playing a sound and loop it
            audio.playSound(path, self, transform, true, cull);
        }
    };
    
    /**
     * Play a sound one time, given the path to the sound.
     * 
     * @param {String} path Path to audio file asset
     * @param {Boolean} cull Flag to NOT play the sound if won't actually be heard by the audioListener.  By default is `false` - generally should only be used for short-lived sounds like gunshots or explosions.
     */    
    this.playOnce = function(path, cull) {
        cull = cull || false;

        //play sound once, no loop
        audio.playSound(path, self, transform, false, cull);
    };
    
    /**
     * Stop playing a sound (or all sounds) started from this emitter.
     * 
     * @param {String} path Optional path of sound to stop playing.
     */    
    this.stopSound = function (path) {
        path = path || false;
        audio.stopSound(entity.id, path);
        
        if (activeLoops[path]) {
            activeLoops[path] = false;
        }
        //TODO: tell audio plugin to stop playing a specific sound, or
        //all sounds started from this emitter's gameObject
    };
    
    //store reference to audio plugin and transform component
    entity.on('entity.create', function() {
        audio = game.getPlugin('audio');
        transform = entity.get('transform2d');
    });

    //stop all sounds from this emitter
    entity.on('entity.destroy', function() {
        audio.clearActive(entity.id);
    });
});
