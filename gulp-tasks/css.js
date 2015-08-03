import gulp from 'gulp';
import filter from 'gulp-filter';
import del from 'del';
import runSequence from 'run-sequence';
import sourcemaps from 'gulp-sourcemaps';

import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer-core';
import pxtorem from 'postcss-pxtorem';

import {DIRECTORIES, PRESETS} from './config';

const SRC = `${DIRECTORIES.src}/stylesheets`;
const DEST = `${DIRECTORIES.target}/stylesheets`;

gulp.task('css:clean', (done) =>
    del([
        DIRECTORIES.target + 'css'
    ], done)
);

gulp.task('css:compile:modern', () =>
    gulp.src([
            `${SRC}/*.scss`,
            `!${SRC}/ie9.*.scss`,
            `!${SRC}/old-ie.*.scss`,
            `!${SRC}/webfonts-*.scss`
        ])
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer(), // uses ./browserslist by default
            pxtorem(PRESETS.pxtorem)
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('css:compile:ie9', () =>
    gulp.src(`${SRC}/ie9.*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer({
                browsers: ['Explorer 9']
            }),
            pxtorem(PRESETS.pxtorem)
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('css:compile:oldIE', () =>
    gulp.src(`${SRC}/old-ie.*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(postcss([
            autoprefixer({
                browsers: ['Explorer 8']
            })
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('css:compile:fonts', () =>
    gulp.src(`${SRC}/webfonts-*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass(PRESETS.sass))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(DEST))
);

gulp.task('css:compile', ['css:clean'], (done) =>
    runSequence([
        'css:compile:modern',
        'css:compile:ie9',
        'css:compile:oldIE',
        'css:compile:fonts'
    ], done)
);

gulp.task('css', ['images'], (done) =>
    runSequence('css:compile', done)
);
