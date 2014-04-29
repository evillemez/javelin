var gulp = require('gulp')
    , pkg = require('./package.json')
    , conf = require('./build-conf.js')
    , fs = require('fs')
    , es = require('event-stream')
    , path = require('path')
    , util = require('gulp-util')
    , concat = require('gulp-concat')
    , jshint = require('gulp-jshint')
    , test = require('gulp-mocha')
    , server = require('gulp-livereload')
    , uglify = require('gulp-uglify')
    , debug = require('gulp-debug')
    , sequence = require('run-sequence')
    , glob = require('glob')
;

gulp.on('err', function(e) {
    util.log(e.err.stack);
});

gulp.task('lint', function() {
    gulp.src(['src/**/*.js', 'demos/**/*.js', 'fixtures/**/*.js', 'tests/**/*.js'])
        .pipe(jshint()).pipe(jshint.reporter('default')).pipe(jshint.reporter('fail'));
});

gulp.task('test', function() {
    gulp.src('tests/**/*.js').pipe(test({reporter: 'spec'})).on('error', util.log);
});

gulp.task('build:javelin', function() {
    var files = gulp.src(conf.paths.javelinCore);
    return es.merge(
        files.pipe(concat('javelin-'+pkg.version+'.core.js')).pipe(gulp.dest('build/javelin/dist/')),
        files.pipe(concat('javelin.core.js')).pipe(gulp.dest('build/javelin/'))
    );
});

gulp.task('build:fixtures', function() {
    return gulp.src(['util/build/fixtures.prefix','fixtures/**/*.js','util/build/fixtures.suffix'])
        .pipe(concat('fixtures.js')).pipe(gulp.dest('build/'));
});

gulp.task('build:packages', function(done) {
    var dirs = glob.sync('src/packages/*/'), finished = 0;
    var cb = function() { if (++finished === dirs.length) {done();}};
    dirs.forEach(function(dir) {
        var dirname = path.basename(dir);
        var files = gulp.src(['util/build/package.prefix', 'src/packages/'+dirname+'/**/*.js','util/build/package.suffix']);
        es.merge(
            files.pipe(concat('javelin-'+pkg.version+'.'+dirname+'.js')).pipe(gulp.dest('build/javelin/dist/')),
            files.pipe(concat('javelin.'+dirname+'.js')).pipe(gulp.dest('build/javelin/'))
        ).on('end', cb);
    });
});

gulp.task('minify', function() {
    return gulp.src('build/javelin/dist/*.js').pipe(uglify()).pipe(gulp.dest('build/javelin/dist/minified/'));
});

gulp.task('build', function(done) {
    sequence(
        ['build:fixtures','build:javelin','build:packages'],
        'minify',
        done
    );
});
gulp.task('default', function(done) { sequence('lint', 'build', 'test', done); });
