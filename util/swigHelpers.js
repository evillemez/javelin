var swig = require('swig');

function createUrlHelpers(baseurl) {
    return {
        homeUrl: function() {},
        apiDocUrl: function(name) {},
        demoDocUrl: function(name) {},
        guideDocUrl: function(name) {}        
    };
}

function renderObjects(grunt, objects, callback) {
    var i, l = objects.length, processed = 0;
    for (i = 0; i < l; i++) {

        var obj = objects[i];

        var cb = function(err, out) {
            if (err) {
                grunt.log.error(err);
                callback(false);
            }

            grunt.log.writeln('Writing ' + obj.file);
            grunt.file.write(obj.file, out);
            processed++;

            if (processed === l) {
                callback();
            }
        };

        swig.renderFile(obj.template, obj.vars, cb);
    }    
}

module.exports = {
    createUrlHelpers: createUrlHelpers,
    renderObjects: renderObjects
};
