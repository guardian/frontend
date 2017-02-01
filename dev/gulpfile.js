/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');

const gulp = require('gulp');
const gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const sassGrapher = require('gulp-sass-grapher');
const filter = require('gulp-filter');

const browserSync = require('browser-sync').create();

const webpack = require('webpack');
const webpackBundler = webpack(require('../webpack.config.js')());

const STATIC = path.resolve(__dirname, '..', 'static');
const SASS_SRC = path.resolve(STATIC, 'src', 'stylesheets');
const SASS_TARGET = path.resolve(STATIC, 'target', 'stylesheets');

const { sassSettings, browserslist, remifications } = require('../dev/css-settings');
const bsConfig = require('./bs-config');

let INITIAL_BUNDLE = true;

gulp.task('watch', (done) => {
    sassGrapher.init(SASS_SRC, { loadPaths: SASS_SRC });

    gutil.log('Creating initial JS bundles...', gutil.colors.cyan('one sec'));

    webpackBundler.watch({
        ignored: /node_modules/,
    }, (err, stats) => {
        if (err) { throw new gutil.PluginError('webpack', err); }

        if (INITIAL_BUNDLE) {
            INITIAL_BUNDLE = false;

            browserSync.init(bsConfig);

            gulp.watch([
                `${SASS_SRC}/**/*.scss`,
            ], (event) => {
                gulp.src(event.path, { base: SASS_SRC })
                    .pipe(sassGrapher.ancestors())
                    .pipe(filter(['**', '!**/ie9*', '!**/old-ie.*', '!**/webfonts-*']))
                    .pipe(sourcemaps.init({ loadMaps: true }))
                    .pipe(sass(Object.assign({
                        includePath: SASS_SRC,
                    }, sassSettings)).on('error', function sassError(sassErr) {
                        gutil.log(sassErr.message);
                        browserSync.sockets.emit('fullscreen:message', {
                            title: 'Sass Error:',
                            body: sassErr.message,
                            timeout: 100000,
                        });
                        this.emit('end');
                    }))
                    .pipe(postcss([
                        autoprefixer(browserslist),
                        pxtorem(remifications),
                    ]))
                    .pipe(sourcemaps.write('.'))
                    .pipe(gulp.dest(SASS_TARGET))
                    .pipe(browserSync.stream({ match: '**/*.css' }))

                    // all working except you can't clear the fullscreen error message in sass

                    .on('end', () => browserSync.sockets.emit('fullscreen:message:clear'));
            });
            return done();
        }
        if (stats.hasErrors() || stats.hasWarnings()) {
            gutil.log(stats.toString('errors-only'));

            return browserSync.sockets.emit('fullscreen:message', {
                title: 'Webpack Error:',
                body: stats.toString('errors-only'),
                timeout: 100000,
            });
        }
        return browserSync.reload();
    });
});
