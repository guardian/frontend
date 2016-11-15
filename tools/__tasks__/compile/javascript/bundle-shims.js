const path = require('path');
const fs = require('fs');
const pify = require('pify');
const uglify = require('uglify-js');

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

const {src, target} = require('../../config').paths;

module.exports = {
    description: 'Bundle shivs and shims',
    task: () => Promise.all([
        path.resolve(src, 'javascripts', 'components', 'es5-shim', 'es5-shim.js'),
        path.resolve(src, 'javascripts', 'components', 'html5shiv', 'html5shiv.js'),
        path.resolve(src, 'javascripts', 'components', 'JSON-js', 'json2.js')
    ].map(file => readFileP(file, 'utf8')))
        .then(srcs => srcs.join(';'))
        .then(src => uglify.minify(src, {
            fromString: true
        }).code)
        .then(src => writeFileP(path.resolve(target, 'javascripts', 'es5-html5.js'), src))
};
