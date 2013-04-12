/*global webkitAudioContext: true */

'use strict';

//TODO: spatial audio w/ filters and what not is not implemented
Javelin.Plugin.Audio = function(plugin, config) {
    
    plugin.$onLoad = function() {
        if (window) {
            plugin.listener = null;
            plugin.audioContext = null;
            plugin.masterVolumeNode = null;
            plugin.loader = null;
            plugin.callbacks = {};

            //map of decoded audio buffers
            plugin.buffers = {};

            //sounds currenctly being played
            plugin.active = {};
            
            plugin.audioContext = new webkitAudioContext();
            //create and connect master volume node - playing sounds are chanelled through
            //that
            plugin.masterVolumeNode = plugin.audioContext.createGainNode(1);
            plugin.masterVolumeNode.connect(plugin.audioContext.destination);
            plugin.loader = plugin.$engine.loader;
        } else {
            plugin.$active = false;
        }
    };
    
    //internal use only
    plugin.loadSound = function(path, callback) {
        //use the engine's loader to get the audio arraybuffer
        plugin.loader.loadAsset(path, function(arraybuffer) {
            //try decoding it
            plugin.audioContext.decodeAudioData(arraybuffer, function(audioBuffer) {                
                //store decoded audio buffers
                plugin.buffers[path] = audioBuffer;
                callback();
            }, function() {
                console.log("Failed decoding audio from " + path);
            });
        });
    };
    
    //play a sound (called internally by the emitter)
    plugin.playSound = function(path, emitter, transform, loop, cull) {
        //load the sound if it isn't loaded
        if (!plugin.buffers[path]) {
            plugin.loadSound(path, function() {
                plugin.playSound(path, emitter, transform, loop, cull);
            });
            return;
        }
        
        //get source for sound, and configure based on emitter
        var source = plugin.audioContext.createBufferSource();
        source.buffer = plugin.buffers[path];
        var id = emitter.$id;
        plugin.active[id] = plugin.active[id] || {};
        var ind;
        
        //set looping
        if (loop) {
            source.loop = true;
        }

        //if the emitter is not spatial, we connect directly to master volume
        if (!emitter.spatial) {
            //connect to master volume node
            source.connect(plugin.masterVolumeNode);

            //store in active sounds (to be processed every frame)
            plugin.active[id][path] = {
                source: source,
                path: path,
                goId: emitter.$id,
                emitter: emitter,
                transform: transform,
                startTime: Date.now(),
                duration: source.buffer.duration,
                loop: false,
                finished: false
            };
        } else {
            //TODO: figure out cull - if the player can't even hear the sound based on the
            //positions, then don't bother actually playing it or doing any other
            //logic associated with it - generally this is only something that should be used
            //for very short-lived sounds like gunshots/explosions
            cull = false;
            if (!cull) {
        
                //now configure based on listener
            
                //connect to master volume node
                source.connect(plugin.masterVolumeNode);

                //store in active sounds (to be processed every frame)
                plugin.active[id][path] = {
                    source: source,
                    path: path,
                    goId: emitter.$id,
                    emitter: emitter,
                    transform: transform,
                    startTime: Date.now(),
                    duration: source.buffer.duration,
                    finished: false,
                    filterNodes: {
                        //TODO: ... store filter nodes here, to
                        //allow changing filter values while the
                        //sound is playing
                    }
                };
            }
        }

        //start actually playing the sound
        source.noteOn(0);
    };
    
    //stop a specific sound, or all sounds for a given gameObject
    plugin.stopSound = function(id, path) {
        path = path || false;
        var p;
        
        if (plugin.active[id]) {
            if (path) {
                if (plugin.active[id][path]) {
                    for (p in plugin.active[id]) {
                        if (p === path) {
                            plugin.active[id][p].source.noteOff(0);
                            plugin.active[id][p].source.disconnect(0);
                            plugin.active[id][p] = null;
                        }
                    }
                }
            } else {
                for (p in plugin.active[id]) {
                    plugin.active[id][p].source.noteOff(0);
                    plugin.active[id][p].source.disconnect(0);
                }

                plugin.active[id] = null;
            }
        }
    };
    
    plugin.clearActive = function(id) {
        plugin.active[id] = null;
    };
        
    plugin.$onGameObjectCreate = function(gameObject) {
        //check for the audio listener
        var listener = gameObject.getComponent('audioListener');
        if (listener) {
            plugin.listener = gameObject;
        }
        
        //check for audio resolve callbacks
        var cbs = gameObject.getCallbacks('audio.resolve');
        if (cbs) {
            plugin.callbacks[gameObject.id] = cbs;
        }
    };
    
    plugin.$onGameObjectDestroy = function(gameObject) {
        if (plugin.callbacks[gameObject.id]) {
            plugin.callbacks[gameObject.id] = null;
        }
    };
    
    plugin.$onPostUpdateStep = function() {
        if (plugin.listener) {
            var listenerPosition = plugin.listener.getComponent('transform2d').position;

            //calculate some node values for each active sound
            for (var id in plugin.active) {
                for (var path in plugin.active[id]) {
                    //calculate volumes and set
                    
                }
            }
            
            //TODO: for each active sound, go call any
            //`audio.resolve` callbacks from components
        }
    };
};
Javelin.Plugin.Audio.alias = 'audio';
