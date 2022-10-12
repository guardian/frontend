const path = require('path');
const cpy = require('cpy');

const { vendor, target } = require('../../config').paths;

module.exports = {
    description: 'Copy 3rd JS party libraries',
    task: () =>
        Promise.all([
            cpy(
                [
                    'formstack-interactive/**/*',
                    'prebid_safeframe.js',
                    'polyfillio.minimum.fallback.js',
                    'omsdk-v1.js',
                ],
                path.resolve(target, 'javascripts', 'vendor'),
                {
                    cwd: path.resolve(vendor, 'javascripts'),
                    parents: true,
                    nodir: true,
                }
            ),
        ]),
};
