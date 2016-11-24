const path = require('path');
const fs = require('fs');
const pify = require('pify');

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

const {src, target} = require('../../config').paths;

module.exports = {
    description: 'Concatenate Webpack-bundled standard, curl and boot etc into app-webpack.js',
    task: () => Promise.all([
        path.resolve(target, 'javascripts', 'boot-webpack.js'),
        path.resolve(src, 'javascripts', 'components', 'curl', 'curl-domReady.js'),
        path.resolve(target, 'javascripts', 'boot-rjs.js')
    ].map(file => readFileP(file, 'utf8')))
        .then(srcs => srcs.join(';'))
        .then(src => writeFileP(path.resolve(target, 'javascripts', 'app-webpack.js'), src))
};
