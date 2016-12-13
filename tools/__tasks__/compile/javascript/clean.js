const path = require('path');
const rimraf = require('rimraf');

const { target, hash, transpiled } = require('../../config').paths;

module.exports = {
    description: 'Clear JS build artefacts',
    task: () => {
        rimraf.sync(path.resolve(target, 'javascripts'));
        rimraf.sync(path.resolve(transpiled, 'javascripts'));
        rimraf.sync(path.resolve(hash, 'javascripts'));
    },
};
