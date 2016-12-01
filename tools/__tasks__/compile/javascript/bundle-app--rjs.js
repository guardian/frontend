const path = require('path');
const fs = require('fs');
const pify = require('pify');

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

const {src, target} = require('../../config').paths;

module.exports = {
    description: 'Create app.js for r.js',
    task: () => Promise.all([
        path.resolve(src, 'javascripts', 'components', 'curl', 'curl-domReady.js'),
        path.resolve(target, 'javascripts', 'boot.js')
    ].map(file => readFileP(file, 'utf8')))
        .then(srcs => srcs.join(';'))
        .then(src => writeFileP(path.resolve(target, 'javascripts', 'app.js'), src))
};
