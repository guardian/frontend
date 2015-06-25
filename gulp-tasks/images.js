import gulp from 'gulp';
import shell from 'gulp-shell';

import {DIRECTORIES} from './config';

const SPRICON_DIR = 'tools/sprites';

gulp.task('images:copy', () =>
    gulp.src(`${DIRECTORIES.public}/images/**/*`)
        .pipe(gulp.dest(`${DIRECTORIES.target}/images`))
);

gulp.task('images:sprite', () =>
    gulp.src(SPRICON_DIR + '/*.json', {read: false})
        .pipe(shell([
            'node spricon.js <%= file.path %>'
        ], {
            cwd: SPRICON_DIR
        }))
);

gulp.task('images', ['images:copy', 'images:sprite']);
