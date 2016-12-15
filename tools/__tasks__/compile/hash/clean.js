const path = require('path');
const rimraf = require('rimraf');

const { hash } = require('../../config').paths;

module.exports = {
    description: 'Clear asset hash artefacts',
    task: () => rimraf.sync(path.resolve(hash, 'assets')),
};
