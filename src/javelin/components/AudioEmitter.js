'use strict';

Javelin.Component.AudioEmitter = function(gameObject, component) {
    var audio = null, transform = null, outputNode = null;
    var filterNodes = {};
    
    //public config values
    component.spatial = true; //if true, culling and filters can be applied - if not true, it connects directly to the audio plugins masterVolumeNode
    component.range = 50;
    component.volume = 100;
    component.getAudioNode = function() {};
    
    /**
     * Play a sound continually, given the path to the sound.
     * 
     * @param {String} path Path to audio file asset
     * @param {Boolean} cull Flag to NOT play the sound if won't actually be heard by the audioListener.  By default is `false` - generally should only be used for short-lived sounds like gunshots or explosions.
     */    
    component.playLoop = function(path, cull) {
        cull = cull || false;
        
        //start playing a sound and loop it
        audio.playSound(path, component, transform, true, cull);
    };
    
    /**
     * Play a sound one time, given the path to the sound.
     * 
     * @param {String} path Path to audio file asset
     * @param {Boolean} cull Flag to NOT play the sound if won't actually be heard by the audioListener.  By default is `false` - generally should only be used for short-lived sounds like gunshots or explosions.
     */    
    component.playOnce = function(path, cull) {
        cull = cull || false;

        //play sound once, no loop
        audio.playSound(path, component, transform, false, cull);
    };
    
    /**
     * Stop playing a sound (or all sounds) started from this emitter.
     * 
     * @param {String} path Optional path of sound to stop playing.
     */    
    component.stopSound = function (path) {
        path = path || false;
        audio.stopSound(gameObject.id, path);
        //TODO: tell audio plugin to stop playing a specific sound, or
        //all sounds started from this emitter's gameObject
    };
    
    //store reference to audio plugin and transform component
    component.$on('engine.create', function() {
        audio = gameObject.engine.getPlugin('audio');
        transform = gameObject.getComponent('transform2d');
    });

    //stop all sounds from this emitter
    component.$on('engine.destroy', function() {
        component.stop();
    });
    
};
Javelin.Component.AudioEmitter.alias = 'audioEmitter';
Javelin.Component.AudioEmitter.requires = ['transform2d'];
