'use strict';

var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path');

//recursively builds array of .js file paths under a given directory
function appendFiles(dir, files) {
    var contents = fs.readdirSync(dir);
    if (!contents.length) {
        return;
    }

    contents.forEach(function(item) {
        var file = [dir, item].join(path.sep);
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            appendFiles(file, files);
        } else if ('.js' === path.extname(file)) {
            files.push(file);
        }
    });
}

module.exports = function(grunt) {

    grunt.registerTask('javelin-docs-parse-api', 'Aggregate Javelin API documentation from the source.', function() {

        //define paths and vars
        var root = path.resolve(__dirname, '..');
        var version = JSON.parse(fs.readFileSync([root,'package.json'].join(path.sep))).version;
        var src = [root, 'src'].join(path.sep),
            dest = [root, 'build', 'docs', version, 'api', 'api.json'].join(path.sep),
            dox = [root,'node_modules','.bin','dox'].join(path.sep),
            files = [],
            docs = {},
            done = this.async(),
            parsed = 0;

        //create containing versioned directory in build
        grunt.file.mkdir([root, 'build', 'docs', version, 'api'].join(path.sep));

        //find all src files to parse
        appendFiles(src, files);

        //parse all files, storing in map
        files.forEach(function(file) {
            var relpath = file.substring(root.length+1);
            docs[relpath] = {relpath: relpath, abspath: file};
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
