const path = require('path');
const cpy = require('cpy');

const { vendor, target, hash } = require('../../config').paths;

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
            cwd: path.resolve(vendor, 'javascripts'),
            parents: true,
            nodir: true,
        }),
        cpy(['**/*'], path.resolve(hash, 'javascripts', 'vendor', 'foresee'), {
            cwd: path.resolve(vendor, 'javascripts', 'foresee'),
            parents: true,
            nodir: true,
        }),
    ]),
};
