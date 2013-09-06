'use strict';

javelin.loader(['.ogg','.mp3'], ['browser'], function(loader, relPath, absPath, done) {
    console.log(relPath);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", absPath, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function() {
        loader.register(relPath, xhr.response);
        done(xhr.response);
    };
    xhr.send();
});