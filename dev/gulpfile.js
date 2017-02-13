/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');

const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');

const STATIC = path.resolve(__dirname, '..', 'static');
const CSS = path.resolve(STATIC, 'target', 'stylesheets');
const JS = path.resolve(STATIC, 'src', 'javascripts-legacy');
const TRANSPILED = path.resolve(STATIC, 'transpiled', 'javascripts');

console.log(CSS);

gulp.task('watch', (done) => {
    gulp.watch([
        `${CSS}/**/*.css`,
        `!${CSS}/ie9.*.css`,
        `!${CSS}/old-ie.*.css`,
        `!${CSS}/webfonts-*.css`,
    ], (event) => {
        gulp.src(event.path, { base: CSS })
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(postcss([
                autoprefixer(),
                pxtorem({
                    replace: true,
                    root_value: 16,
                    unit_precision: 5,
                    prop_white_list: [],
                }),
            ]))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(CSS));
    });

    // copy any changed legacy js to the transpiled directory
    gulp.watch([
        `${JS}/**/*.js`,
    ], (event) => {
        gulp.src(event.path, { base: JS })
            .pipe(gulp.dest(TRANSPILED));
    });

    done();
});
