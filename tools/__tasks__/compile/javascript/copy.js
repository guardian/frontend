const path = require('path');
const cpy = require('cpy');

const { src, target, hash, transpiled } = require('../../config').paths;

module.exports = {
    description: 'Copy 3rd JS party libraries',
    task: () => Promise.all([
        cpy([
            'formstack-interactive/**/*',
            'omniture/**/*',
            'prebid/**/*',
            'stripe/**/*',
            'react/**/*',
            'ophan/**/*',
        ], path.resolve(target, 'javascripts', 'vendor'), {
            cwd: path.resolve(src, 'javascripts', 'vendor'),
            parents: true,
            nodir: true,
        }),
        cpy(['**/*'], path.resolve(hash, 'javascripts', 'vendor', 'foresee'), {
            cwd: path.resolve(src, 'javascripts', 'vendor', 'foresee'),
            parents: true,
            nodir: true,
        }),
        cpy([
            'components/**/*',
            'vendor/**/*',
            'projects/**/*.html'
        ], path.resolve(transpiled, 'javascripts'), {
            cwd: path.resolve(src, 'javascripts'),
            parents: true,
            nodir: true
        }),
    ]),
};
