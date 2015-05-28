var gulp = require('gulp');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer-core');
var pxtorem = require('postcss-pxtorem');
var filter = require('gulp-filter');
var del = require('del');
var runSequence = require('run-sequence');

var config = require('./config');
var dest = config.dir.target + 'stylesheets/';

gulp.task('clean:stylesheets', function (cb) {
    del([
        config.dir.target + 'stylesheets'
    ], cb);
});

gulp.task('stylesheets:modern', function () {
    return gulp.src([
            config.dir.src + 'stylesheets/*.scss',
            '!' + config.dir.src + 'stylesheets/ie9.*.scss',
            '!' + config.dir.src + 'stylesheets/old-ie.*.scss',
            '!' + config.dir.src + 'stylesheets/webfonts-*.scss'
        ])
        .pipe(sourcemaps.init())
        .pipe(sass(config.presets.sass))
        .pipe(postcss([
            autoprefixer(),
            pxtorem(config.presets.pxtorem)
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
});

gulp.task('stylesheets:ie9', function () {
    return gulp.src(config.dir.src + 'stylesheets/ie9.*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(config.presets.sass))
        .pipe(postcss([
            autoprefixer(),
            pxtorem(config.presets.pxtorem)
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
});

gulp.task('stylesheets:oldIE', function () {
    return gulp.src(config.dir.src + 'stylesheets/old-ie.*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(config.presets.sass))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
});

gulp.task('stylesheets:fonts', function () {
    return gulp.src(config.dir.src + 'stylesheets/webfonts-*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass(config.presets.sass))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(dest));
});

gulp.task('stylesheets', ['images'], function (cb) {
    runSequence(
        'clean:stylesheets',
        [
            'stylesheets:modern',
            'stylesheets:ie9',
            'stylesheets:oldIE',
            'stylesheets:fonts'
        ],
        cb
    );
});
