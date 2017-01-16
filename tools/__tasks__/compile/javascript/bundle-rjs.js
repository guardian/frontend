const path = require('path');
const fs = require('fs');
const pify = require('pify');

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

const { vendor, target } = require('../../config').paths;

module.exports = {
    description: 'Create app.js for r.js',
    task: () => Promise.all([
        path.resolve(vendor, 'javascripts', 'components', 'curl', 'curl-domReady.js'),
        path.resolve(target, 'javascripts', 'boot.js'),
    ].map(file => readFileP(file, 'utf8')))
        .then(srcs => srcs.join(';'))
        .then(allSrcs => writeFileP(path.resolve(target, 'javascripts', 'app.js'), allSrcs)),
};
