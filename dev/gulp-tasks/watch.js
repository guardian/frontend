import gulp from 'gulp';
import watch from 'gulp-watch';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';

import {DIRECTORIES, PRESETS} from './config';

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




