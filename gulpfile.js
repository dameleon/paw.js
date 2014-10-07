var gulp = require('gulp');
var tsc = require('gulp-tsc');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var stylish = require('jshint-stylish');

var DIST_PATH = 'dist/'
var SRC_LIST = ['src/**/paw.js', 'src/*.js'];

gulp.task('compile', function() {
    gulp.src(SRC_LIST)
        .pipe(concat('paw.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('compile_with_polyfill', function() {
    var files = [].slice.call(SRC_LIST);

    files.unshift('src/polyfills/*.js');
    gulp.src(files)
        .pipe(concat('paw.polyfill.min.js'))
        .pipe(uglify())
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
