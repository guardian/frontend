const path = require('path');
const cpy = require('cpy');

const { src, vendor, target, transpiled } = require('../../config').paths;

module.exports = {
    description: 'Copy 3rd JS party libraries',
    task: () =>
        Promise.all([
            cpy(
                ['formstack-interactive/**/*'],
                path.resolve(target, 'javascripts', 'vendor'),
                {
                    cwd: path.resolve(vendor, 'javascripts'),
                    parents: true,
                    nodir: true,
                }
            ),

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
