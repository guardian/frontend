const gulp = require('gulp');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const gutil = require('gulp-util');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer-core');
const pxtorem = require('postcss-pxtorem');

const {DIRECTORIES, PRESETS} = require('./config');

const TARGET = `${DIRECTORIES.target}/stylesheets`;

gulp.task('watch:css', (done) => {

    gulp.watch([
            `${TARGET}/**/*.css`,
            `!${TARGET}/ie9.*.css`,
            `!${TARGET}/old-ie.*.css`,
            `!${TARGET}/webfonts-*.css`
        ], (event) => {

            gulp.src(event.path, {base: TARGET})
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(postcss([
                    autoprefixer(),
                    pxtorem(PRESETS.pxtorem)
                ]))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(TARGET))
    });
    done();
});




