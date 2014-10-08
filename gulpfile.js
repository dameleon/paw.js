var pkg = require('./package.json');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var stylish = require('jshint-stylish');
var header = require('gulp-header');

var DIST_PATH = 'dist/'
var SRC_LIST = ['src/**/paw.js', 'src/*.js'];
var banner = '/*! <%= pkg.name %> // @version <%= pkg.version %>, @license <%= pkg.license %>, @author <%= pkg.author %> */\n';

gulp.task('compile', function() {
    // Not minified
    gulp.src(SRC_LIST)
        .pipe(concat('paw.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(DIST_PATH));

    // Minified
    gulp.src(SRC_LIST)
        .pipe(concat('paw.min.js'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
         .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('compile_with_polyfill', function() {
    var files = [].slice.call(SRC_LIST);
    files.unshift('src/polyfills/*.js');

    // Not minified
    gulp.src(files)
        .pipe(concat('paw.polyfill.js'))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(DIST_PATH));

    // Minified
    gulp.src(files)
        .pipe(concat('paw.polyfill.min.js'))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('jshint', function() {
    gulp.src(SRC_LIST)
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('develop', ['default'], function() {
    gulp.watch(SRC_LIST, ['compile']);
});

gulp.task('dist', ['jshint', 'compile', 'compile_with_polyfill']);

gulp.task('default', ['dist']);
