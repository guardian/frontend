const path = require('path');
const cpy = require('cpy');

const { conf, target, hash, src } = require('../../config').paths;

module.exports = {
    description: 'Copy assets',
    task: () =>
        Promise.all([
            cpy('curl.js', conf, {
                cwd: path.resolve(
                    path.dirname(require.resolve('curl')),
                    '..',
                    'dist',
                    'curl-with-js-and-domReady'
                ),
            }),
            cpy(
                ['**/head*.css', 'inline/**/*.css'],
                path.resolve(conf, 'inline-stylesheets'),
                {
                    cwd: path.resolve(target, 'stylesheets'),
                }
            ),
            cpy(['**/assets.map'], path.resolve(conf), {
                cwd: path.resolve(hash, 'assets'),
            }),
            cpy(['polyfill.io'], path.resolve(conf), {
                cwd: path.resolve(src, 'javascripts'),
            }),
        ]),
};
