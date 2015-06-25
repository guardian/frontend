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

gulp.task('stylesheets:clean', (cb) =>
    del([
        DIRECTORIES.target + 'stylesheets'
    ], cb)
);

gulp.task('stylesheets:compile:modern', () =>
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

gulp.task('stylesheets:compile:ie9', () =>
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

gulp.task('stylesheets:compile:oldIE', () =>
    gulp.src(`${SRC}/old-ie.*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer()
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('stylesheets:compile:fonts', () =>
    gulp.src(`${SRC}/webfonts-*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('stylesheets:compile', ['stylesheets:clean'], (cb) =>
    runSequence([
        'stylesheets:compile:modern',
        'stylesheets:compile:ie9',
        'stylesheets:compile:oldIE',
        'stylesheets:compile:fonts'
    ], cb)
);

gulp.task('stylesheets', ['images'], (cb) =>
    runSequence('stylesheets:compile', cb)
);
