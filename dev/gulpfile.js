/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const sassGrapher = require('gulp-sass-grapher');
const filter = require('gulp-filter');

const browserSync = require('browser-sync').create();

const STATIC = path.resolve(__dirname, '..', 'static');
const SASS_SRC = path.resolve(STATIC, 'src', 'stylesheets');
const SASS_TARGET = path.resolve(STATIC, 'target', 'stylesheets');

const { sassSettings, browserslist, remifications } = require('../dev/css-settings');
const bsConfig = require('./bs-config');

gulp.task('watch', (done) => {
    browserSync.init(bsConfig);

    sassGrapher.init(SASS_SRC, { loadPaths: SASS_SRC });

    gulp.watch([
        `${SASS_SRC}/**/*.scss`,
    ], (event) => {
        gulp.src(event.path, { base: SASS_SRC })
            .pipe(sassGrapher.ancestors())
            .pipe(filter(['**', '!**/ie9*', '!**/old-ie.*', '!**/webfonts-*']))
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sass(Object.assign({
                includePath: SASS_SRC,
            }, sassSettings)))
            .pipe(postcss([
                autoprefixer(browserslist),
                pxtorem(remifications),
            ]))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(SASS_TARGET))
            .pipe(browserSync.stream({ match: '**/*.css' }));
    });

    done();
});
