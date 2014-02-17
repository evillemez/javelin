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

        (function (object, callback) {
            
            swig.renderFile(object.template, object.vars, function(err, out) {
                if (err) {
                    grunt.log.error(err);
                    callback(false);
                }

                grunt.log.writeln('Writing ' + object.file);
                grunt.file.write(object.file, out);
                processed++;

                if (processed === l) {
                    callback();
                }
            });

        })(objects[i], callback);
    }    
}

module.exports = {
    createUrlHelpers: createUrlHelpers,
    renderObjects: renderObjects
};
