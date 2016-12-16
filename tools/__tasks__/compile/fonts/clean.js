const path = require('path');
const rimraf = require('rimraf');

const { target, hash } = require('../../config').paths;

module.exports = {
    description: 'Clear font build artefacts',
    task: () => {
        rimraf.sync(path.resolve(target, 'fonts'));
        rimraf.sync(path.resolve(hash, 'fonts'));
    },
};
