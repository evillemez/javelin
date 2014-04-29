/**
 * Handles loading sound files in a browser.
 *
 * @package  audio2d
 * @type loader
 */
javelin.loader(['.mp3','.ogg'], ['browser'], function(loader, relPath, absPath, done) {
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
