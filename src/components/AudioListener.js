'use strict';

Javelin.Component.AudioListener = function(gameObject, component) {
    component.range = 100;
    component.dropoff = 50;
    
    component.getAudioNode = function() {};
    //TODO: filters
};
Javelin.Component.AudioListener.alias = 'audioListener';
Javelin.Component.AudioListener.requires = ['transform2d'];
