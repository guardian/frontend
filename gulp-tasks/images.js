var gulp = require('gulp');
var shell = require('gulp-shell');

var config = require('./config');

gulp.task('images:copy', function () {
    return gulp.src('static/public/images/**/*')
        .pipe(gulp.dest(config.dir.target + 'images'))
});

gulp.task('images:sprite', function () {
    var spriconDir = 'tools/sprites';

    return gulp.src(spriconDir + '/*.json', {read: false})
        .pipe(shell([
            'node spricon.js <%= file.path %>'
        ], {
            cwd: spriconDir
        }));
});

gulp.task('images', ['images:copy', 'images:sprite']);
