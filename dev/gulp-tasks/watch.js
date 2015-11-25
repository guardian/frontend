import gulp from 'gulp';
import watch from 'gulp-watch';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer-core';
import pxtorem from 'postcss-pxtorem';

import {DIRECTORIES, PRESETS} from './config';

const SRC = `${DIRECTORIES.target}/stylesheets`;
const DEST = `${DIRECTORIES.hash}/stylesheets`;

gulp.task('watch:css', (done) => {
    gulp.watch([
            `${SRC}/*.css`,
            `!${SRC}/ie9.*.css`,
            `!${SRC}/old-ie.*.css`,
            `!${SRC}/webfonts-*.css`
        ], (event) => {
            gulp.src(event.path)
                .pipe(sourcemaps.init({loadMaps: true}))
                .pipe(postcss([
                    autoprefixer(),
                    pxtorem(PRESETS.pxtorem)
                ]))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(DEST))
    });
    done();
});




