var gulp = require('gulp')
    , pkg = require('./package.json')
    , conf = require('./build-conf.js')
    , fs = require('fs')
    , util = require('gulp-util')
    , concat = require('gulp-concat')
    , jshint = require('gulp-jshint')
    , test = require('gulp-mocha')
    , server = require('gulp-livereload')
    , uglify = require('gulp-uglify')
    , debug = require('gulp-debug')
;

gulp.on('err', function(e) {
    console.log(e.err.stack);
});

gulp.task('lint', function() {
    gulp.src(['src/**/*.js', 'demos/**/*.js', 'fixtures/**/*.js', 'tests/**/*.js'])
        .pipe(jshint()).pipe(jshint.reporter('default')).pipe(jshint.reporter('fail'));
});

gulp.task('test', function() {
    gulp.src('tests/**/*.js').pipe(test({reporter: 'spec'})).on('error', util.log);
});

gulp.task('build:javelin', function() {
    gulp.src(conf.paths.javelinCore)
        .pipe(concat('javelin-'+pkg.version+'.core.js')).pipe(gulp.dest('build/javelin/'))
        .pipe(concat('javelin.js')).pipe(gulp.dest('build/javelin/'));
});

gulp.task('build:fixtures', function() {
    gulp.src(['util/build/fixtures.prefix','fixtures/**/*.js','util/build/fixtures.suffix'])
        .pipe(concat('fixtures.js')).pipe(gulp.dest('build/'));
});

gulp.task('build:packages', function() {
    util.log('package build not implemented...');
});

gulp.task('minify', function() {
    gulp.src('build/javelin/*.js').pipe(uglify()).pipe(gulp.dest('build/javelin/minified/'));
});

gulp.task('build', ['build:fixtures','build:javelin','build:packages']);
gulp.task('default', ['lint', 'build', 'test', 'minify']);
