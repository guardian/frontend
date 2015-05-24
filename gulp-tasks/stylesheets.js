var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer-core');
var pxtorem = require('postcss-pxtorem');
var filter = require('gulp-filter');
var filelog = require('gulp-filelog');

var config = require('./config');

function compileSass (src) {
    var prefixFilter = filter(function (file) {
        return !/webfonts/.test(file.path);
    });

    var remFilter = filter(function (file) {
        return !/ie9/.test(file.path);
    });

    return gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded',
            precision: 5
        }))
        .pipe(prefixFilter)
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(remFilter)
        .pipe(postcss([
            pxtorem({
                replace: true,
                root_value: 16,
                unit_precision: 5
            })
        ]))
        .pipe(remFilter.restore())
        .pipe(prefixFilter.restore())
        .pipe(gulp.dest(config.dir.target + 'stylesheets/'))
        .pipe(sourcemaps.write('.'));
};

gulp.task('stylesheets', ['images'], function () {
    return compileSass([
        config.dir.src + 'stylesheets/*.scss'
    ])
});
