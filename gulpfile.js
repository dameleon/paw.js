var path = require('path');
var gulp = require('gulp');
var tsc = require('gulp-tsc');
var uglify = require('gulp-uglify');

const SRC_PATH = 'src/';
const DIST_PATH = 'dist/';

gulp.task('compile', function() {
    gulp.src(__pj(SRC_PATH, '**/*.js'))
        .pipe(uglify())
        .pipe(gulp.dest(DIST_PATH));
});

gulp.task('develop', ['default'], function() {
    gulp.watch([__pj(SRC_PATH, '**/*.js')], ['tsc']);
});

gulp.task('default', ['tsc']);

function __pj() {
    return path.join.apply(null, arguments)
}
