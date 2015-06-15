import gulp from 'gulp';
import shell from 'gulp-shell';

import {DIRECTORIES} from './config';

gulp.task('images:copy', () =>
    gulp.src(`${DIRECTORIES.public}/images/**/*`)
        .pipe(gulp.dest(`${DIRECTORIES.target}/images`))
);

gulp.task('images:sprite', () => {
    var spriconDir = 'tools/sprites';

    return gulp.src(spriconDir + '/*.json', {read: false})
        .pipe(shell([
            'node spricon.js <%= file.path %>'
        ], {
            cwd: spriconDir
        }));
});

gulp.task('images', ['images:copy', 'images:sprite']);
