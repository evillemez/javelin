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
    , sequence = require('run-sequence')
    , rename = require('gulp-rename')
    , glob = require('glob')
    , javelinBuildDemos = require('./tasks/build-demos.js')
;

gulp.on('err', function(e) {
    util.log(e.err.stack);
});

gulp.task('lint', function() {
    gulp.src(['src/**/*.js', 'demos/**/*.js', 'fixtures/**/*.js', 'tests/**/*.js'])
        .pipe(jshint('.jshintrc')).pipe(jshint.reporter('jshint-stylish'));
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

gulp.task('docs:demos:ghp', function() { return javelinBuildDemos(gulp, conf.docs.ghp.demos); });
gulp.task('docs:demos:local', function() { return javelinBuildDemos(gulp, conf.docs.local.demos); });
gulp.task('docs:demos:ghplocal', function() { return javelinBuildDemos(gulp, conf.docs.ghplocal.demos); });

// gulp.task('docs:api:ghp', function() { return javelinBuildApi(gulp, conf.docs.ghp.api); });
// gulp.task('docs:api:local', function() { return javelinBuildApi(gulp, conf.docs.local.api); });
// gulp.task('docs:api:ghplocal', function() { return javelinBuildApi(gulp, conf.docs.ghplocal.api); });

// gulp.task('docs:guides:ghp', function() { return javelinBuildGuides(gulp, conf.docs.ghp.guides); });
// gulp.task('docs:guides:local', function() { return javelinBuildGuides(gulp, conf.docs.local.guides); });
// gulp.task('docs:guides:ghplocal', function() { return javelinBuildGuides(gulp, conf.docs.ghplocal.guides); });

// gulp.task('docs:local', ['docs:demos:local','docs:api:local','docs:guides:local'], function() {
//     //build index, copy javelin
// });
// gulp.task('docs:ghp', ['docs:demos:ghp','docs:api:ghp','docs:guides:ghp'], function() {
//     //build index
// });
// gulp.task('docs:ghplocal', ['docs:demos:ghplocal','docs:api:ghplocal','docs:guides:ghplocal'], function() {
//     //build index
// });

// gulp.task('docs', ['docs:local','server:docs']);

gulp.task('minify', function() {
    return gulp.src('build/javelin/dist/*.js').pipe(rename({extname: '.min.js'})).pipe(uglify()).pipe(gulp.dest('build/javelin/dist/minified/'));
});

gulp.task('build', function(done) {
    sequence(['build:fixtures','build:javelin','build:packages'], 'minify', done);
});

gulp.task('default', function(done) { sequence('lint', 'build', 'test', done); });
