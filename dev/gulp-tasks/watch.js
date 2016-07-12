import gulp from 'gulp';
import watch from 'gulp-watch';
import shell from 'gulp-shell';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';

import {DIRECTORIES, PRESETS} from './config';

const SRC = `${DIRECTORIES.src}/stylesheets`;
const TARGET = `${DIRECTORIES.target}/stylesheets`;

gulp.task('atomise-css', shell.task(['make atomise-css'], {
    cwd: '../'
}))

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

    gulp.watch(`${DIRECTORIES.src}/stylesheets-atomised/**/*.scss`, ['atomise-css']);
    done();
});




