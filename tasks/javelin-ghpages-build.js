'use strict';

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path'),
    swig = require('swig')
;

module.exports = function(grunt) {

    grunt.registerMultiTask('javelin-ghpages-build', 'Build GH Pages site.', function() {
        var root = path.resolve(__dirname, '..');
        var templatesDir = [root, 'util', 'ghpages', 'templates'].join(path.sep)
            , ops = this.options(this.data)
            , buildDir = [root, ops.basedir].join(path.sep)
            , renderObjects = []
            , templateVars = grunt.file.readJSON([root,'util','ghpages','templateVars.json'].join(path.sep))
            , done = this.async()
        ;
        templateVars.baseurl = ops.baseurl;

        //make build directory
        grunt.log.writeln(buildDir);
        grunt.file.mkdir(buildDir);

        //assemble index
        renderObjects.push({
            template: [templatesDir, 'index.swig.html'].join(path.sep),
            file: [buildDir, 'index.html'].join(path.sep),
            vars: templateVars
        });

        //TODO: assemble data for other pages

        //render all templates to final location
        var i, l = renderObjects.length, processed = 0;
        for (i = 0; i < l; i++) {

            var obj = renderObjects[i];

            var cb = function(err, out) {
                if (err) {
                    grunt.log.error(err);
                    done(false);
                }

                grunt.log.writeln('Writing ' + obj.file);
                grunt.file.write(obj.file, out);
                processed++;

                if (processed === l) {
                    done();
                }
            };

            swig.renderFile(obj.template, obj.vars, cb);
        }
    });
};
