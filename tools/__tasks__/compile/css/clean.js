const path = require('path');
const rimraf = require('rimraf');

const {target, hash} = require('../../config').paths;

module.exports = {
    description: 'Clear CSS build artefacts',
    task: () => {
        rimraf.sync(path.resolve(target, 'stylesheets'));
        rimraf.sync(path.resolve(hash, 'stylesheets'));
    }
};
