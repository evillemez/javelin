'use strict';

javelin.component('audioListener', function(entity, game) {
    this.range = 100;
    this.dropoff = 50;
    
    this.getAudioNode = function() {};
    //TODO: filters
    
}, ['transform2d']);
