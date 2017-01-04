const path = require('path');
const cpy = require('cpy');

const { vendor, conf, target, hash } = require('../../config').paths;

module.exports = {
    description: 'Copy assets',
    task: () => Promise.all([
        cpy(['curl-domReady.js'], conf, {
            cwd: path.resolve(vendor, 'javascripts', 'components', 'curl'),
        }),
        cpy(['**/head*.css', 'inline/**/*.css'], path.resolve(conf, 'inline-stylesheets'), {
            cwd: path.resolve(target, 'stylesheets'),
        }),
        cpy(['**/assets.map'], path.resolve(conf), {
            cwd: path.resolve(hash, 'assets'),
        }),
    ]),
};
