const path = require('path');
const cpy = require('cpy');

const { src, vendor, target, hash, transpiled } = require('../../config').paths;

module.exports = {
    description: 'Copy 3rd JS party libraries',
    task: () =>
        Promise.all([
            cpy(
                [
                    'formstack-interactive/**/*',
                    'omniture/**/*',
                    'prebid/**/*',
                    'stripe/**/*',
                    'react/**/*',
                    'ophan/**/*',
                    'foresee/**/*',
                ],
                path.resolve(target, 'javascripts', 'vendor'),
                {
                    cwd: path.resolve(vendor, 'javascripts'),
                    parents: true,
                    nodir: true,
                }
            ),
            cpy(
                ['**/*'],
                path.resolve(hash, 'javascripts', 'vendor', 'foresee'),
                {
                    cwd: path.resolve(vendor, 'javascripts', 'foresee'),
                    parents: true,
                    nodir: true,
                }
            ),

            // copy the legacy (untranspiled es5) code to `transpiled`.
            // once the legacy directory has been converted, this won't be needed.
            cpy(['**/*'], path.resolve(transpiled, 'javascripts'), {
                cwd: path.resolve(src, 'javascripts-legacy'),
                parents: true,
                nodir: true,
            }),

            // copy all non-JS source files from the JS directory
            // e.g. *.html templates etc
            cpy(['**/*'], path.resolve(transpiled, 'javascripts'), {
                cwd: path.resolve(src, 'javascripts'),
                parents: true,
                nodir: true,
                ignore: '**/*.js',
            }),
        ]),
};
