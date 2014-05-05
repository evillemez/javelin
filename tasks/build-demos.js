var   pkg = require('../package.json')
    , fs = require('fs')
    , path = require('path')
    , swig = require('gulp-swig')
    , es = require('event-stream')
    , util = require('gulp-util')
    , rename = require('gulp-rename')
    , debug = require('gulp-debug')
    , glob = require('glob')
    , Q = require('q')
;

module.exports = function (gulp, config) {
    var demoMeta = [], promises = [];

    //parse each demo
    glob('demos/*/', function(err, dirs) {

        //build individual demos
        dirs.forEach(function(dir) {
            var file = dir + 'meta.json';

            if (!fs.existsSync(file)) {
                return;
            }

            //TODO: make async
            var data = JSON.parse(fs.readFileSync(file));
            data.path = dir;
            demoMeta.push(data);
            var demoTarget = config.target + data.dir;
            var deferred = Q.defer();
            promises.push(deferred.promise);

            //TODO: parse README
            //TODO: resolve all scripts
            var swigOpts = {
                data: {
                    meta: data,
                    readme: 'TODO - import readme',
                    scripts: data.scripts
                }
            };

            //copy files, render template
            es.merge(
                gulp.src(data.path + 'js/**/*.js').pipe(gulp.dest(demoTarget+'/js/')),
                gulp.src(data.path + 'assets/**/*.*').pipe(gulp.dest(demoTarget+'/assets/')),
                gulp.src('util/docs/templates/demo.swig.html').pipe(swig(swigOpts)).pipe(rename('index.html')).pipe(gulp.dest(demoTarget))
            ).on('end', function() {
                deferred.resolve(true);
            });
        });
        
        //set up parsing main demo index
        var deferred = Q.defer();
        promises.push(deferred.promise);

        var swigOpts = {
            data: {
                version: pkg.version,
                baseurl: config.baseurl,
                demos: demoMeta
            }
        };

        //now render main demo file
        //and copy shared assets
        es.merge(
            gulp.src('util/docs/templates/demos.index.swig.html').pipe(swig(swigOpts)).pipe(rename('index.html')).pipe(gulp.dest(config.target)),
            gulp.src('demos/shared/**/').pipe(gulp.dest(config.target))
        ).on('end', function() {
            deferred.resolve(true);
        });

        return Q.all(promises);
    });

};
