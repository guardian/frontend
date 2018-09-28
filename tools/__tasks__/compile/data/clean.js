const path = require('path');
const rimraf = require('rimraf');

const { target, hash } = require('../../config').paths;

module.exports = {
    description: 'Clear Data build artefacts',
    task: () => {
        rimraf.sync(path.resolve(target, 'data'));
        rimraf.sync(path.resolve(hash, 'data'));
    },
};
