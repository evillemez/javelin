'use strict';

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path');

module.exports = function(grunt) {

    grunt.registerMultiTask('javelin-docs-parse-api', 'Aggregate Javelin API documentation from the source.', function() {
        var ops = this.options(this.data);

        //define paths and vars
        var root = path.resolve(__dirname, '..');
        var version = JSON.parse(fs.readFileSync([root,'package.json'].join(path.sep))).version;
        var dest = [root, ops.dest].join(path.sep),
            dox = [root,'node_modules','.bin','dox'].join(path.sep),
            files = grunt.file.expand(ops.src),
            docs = {},
            done = this.async(),
            parsed = 0;

        //create containing versioned directory in build
        grunt.file.mkdir(path.dirname(ops.dest));

        //parse all files, storing in map
        files.forEach(function(file) {
            var relpath = file;
            var abspath = [root, file].join(path.sep);
            docs[relpath] = {relpath: relpath, abspath: abspath};
            grunt.log.writeln('Parsing ' + relpath);

            //use dox to parse file
            var command = [dox, '--raw', '<', file].join(' ');
            exec(command, function(error, stout, sterr) {
                if (error) {
                    grunt.log.error("Failed parsing " + file);
                    done(false);
                }

                docs[relpath].docs = JSON.parse(stout);
                parsed++;

                if (parsed >= files.length) {
                    grunt.log.writeln("Writing assembled API docs to " + dest);
                    fs.writeFileSync(dest, JSON.stringify(docs));
                    done();
                }
            });
        });
    });

};
