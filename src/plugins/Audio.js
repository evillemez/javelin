/*global webkitAudioContext: true */

'use strict';

//TODO: spatial audio w/ filters and what not is not implemented
javelin.plugin('audio', function(config, game) {
    var self = this;

    var loader = game.loader;
    
    this.$onLoad = function() {
        if (window) {
            self.listener = null;
            self.audioContext = null;
            self.masterVolumeNode = null;
            self.loader = null;
            self.callbacks = {};

            //map of decoded audio buffers
            self.buffers = {};

            //sounds currenctly being played
            self.active = {};
            
            self.audioContext = new webkitAudioContext();
            //create and connect master volume node - playing sounds are chanelled through
            //that
            self.masterVolumeNode = self.audioContext.createGainNode(1);
            self.masterVolumeNode.connect(self.audioContext.destination);
            self.loader = self.$engine.loader;
        } else {
            self.$active = false;
        }
    };
    
    this.$onUnload = function() {
        for (var id in self.active) {
            self.stopSound(id);
        }
    };
    
    //internal use only
    this.loadSound = function(path, callback) {
        //use the engine's loader to get the audio arraybuffer
        self.loader.loadAsset(path, function(arraybuffer) {
            //try decoding it
            self.audioContext.decodeAudioData(arraybuffer, function(audioBuffer) {                
                //store decoded audio buffers
                self.buffers[path] = audioBuffer;
                callback();
            }, function() {
                console.log("Failed decoding audio from " + path);
            });
        });
    };
    
    //play a sound (called internally by the emitter)
    this.playSound = function(path, emitter, transform, loop, cull) {
        //load the sound if it isn't loaded
        if (!self.buffers[path]) {
            self.loadSound(path, function() {
                self.playSound(path, emitter, transform, loop, cull);
            });
            return;
        }
        
        //get source for sound, and configure based on emitter
        var source = self.audioContext.createBufferSource();
        source.buffer = self.buffers[path];
        var id = emitter.$id;
        self.active[id] = self.active[id] || {};
        var ind;
        
        //set looping
        if (loop) {
            source.loop = true;
        }

        //if the emitter is not spatial, we connect directly to master volume
        if (!emitter.spatial) {
            //connect to master volume node
            source.connect(self.masterVolumeNode);

            //store in active sounds (to be processed every frame)
            self.active[id][path] = {
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
                source.connect(self.masterVolumeNode);

                //store in active sounds (to be processed every frame)
                self.active[id][path] = {
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
    this.stopSound = function(id, path) {
        path = path || false;
        var p;
        
        if (self.active[id]) {
            if (path) {
                if (self.active[id][path]) {
                    for (p in self.active[id]) {
                        if (p === path) {
                            self.active[id][p].source.noteOff(0);
                            self.active[id][p].source.disconnect(0);
                            self.active[id][p] = null;
                        }
                    }
                }
            } else {
                for (p in self.active[id]) {
                    if (null !== self.active[id][p]) {
                        self.active[id][p].source.noteOff(0);
                        self.active[id][p].source.disconnect(0);
                    }
                }

                self.active[id] = null;
            }
        }
    };
    
    this.clearActive = function(id) {
        self.active[id] = null;
    };
        
    this.$onGameObjectCreate = function(gameObject) {
        //check for the audio listener
        var listener = gameObject.getComponent('audioListener');
        if (listener) {
            self.listener = gameObject;
        }
        
        //check for audio resolve callbacks
        var cbs = gameObject.getCallbacks('audio.resolve');
        if (cbs) {
            self.callbacks[gameObject.id] = cbs;
        }
    };
    
    this.$onGameObjectDestroy = function(gameObject) {
        if (self.callbacks[gameObject.id]) {
            self.callbacks[gameObject.id] = null;
        }
        
        self.stopSound(gameObject.id);
    };
    
    this.$onPostUpdateStep = function() {
        if (self.listener) {
            var listenerPosition = self.listener.getComponent('transform2d').position;

            //calculate some node values for each active sound
            for (var id in self.active) {
                for (var path in self.active[id]) {
                    //calculate volumes and set
                    
                }
            }
            
            //TODO: for each active sound, go call any
            //`audio.resolve` callbacks from components
        }
    };
});
