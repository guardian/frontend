import gulp from 'gulp';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer-core';
import pxtorem from 'postcss-pxtorem';
import filter from 'gulp-filter';
import del from 'del';
import runSequence from 'run-sequence';

import {DIRECTORIES} from './config';

const SRC = `${DIRECTORIES.src}/stylesheets`;
const DEST = `${DIRECTORIES.target}/stylesheets`;

const PRESETS = {
    sass: {
        outputStyle: 'compressed',
        precision: 5
    },
    pxtorem: {
        replace: true,
        root_value: 16,
        unit_precision: 5,
        prop_white_list: 'all'
    }
}

gulp.task('clean:stylesheets', (cb) =>
    del([
        DIRECTORIES.target + 'stylesheets'
    ], cb)
);

gulp.task('stylesheets:modern', () =>
    gulp.src([
            `${SRC}/*.scss`,
            `!${SRC}/ie9.*.scss`,
            `!${SRC}/old-ie.*.scss`,
            `!${SRC}/webfonts-*.scss`
        ])
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer(),
            pxtorem(PRESETS.pxtorem)
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('stylesheets:ie9', () =>
    gulp.src(`${SRC}/ie9.*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer(),
            pxtorem(PRESETS.pxtorem)
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('stylesheets:oldIE', () =>
    gulp.src(`${SRC}/old-ie.*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('stylesheets:fonts', () =>
    gulp.src(`${SRC}/webfonts-*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('stylesheets', (cb) =>
    runSequence(
        'clean:stylesheets',
        [
            'stylesheets:modern',
            'stylesheets:ie9',
            'stylesheets:oldIE',
            'stylesheets:fonts'
        ],
        cb
    )
);
