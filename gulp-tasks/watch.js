import gulp from 'gulp';
import watch from 'gulp-watch';
import debug from 'gulp-debug';
import sourcemaps from 'gulp-sourcemaps';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer-core';
import pxtorem from 'postcss-pxtorem';

import {DIRECTORIES, PRESETS} from './config';

const SRC = `${DIRECTORIES.target}/stylesheets`;
const DEST = `${DIRECTORIES.hash}/stylesheets`;

gulp.task('watch:css', () => {
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
});




