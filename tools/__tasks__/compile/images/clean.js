const path = require('path');
const rimraf = require('rimraf');

const {target, hash, src} = require('../../config').paths;

module.exports = {
    description: 'Clear image build artefacts',
    task: () => {
        rimraf.sync(path.resolve(src, 'stylesheets', 'icons'));
        rimraf.sync(path.resolve(target, 'images'));
        rimraf.sync(path.resolve(hash, 'images'));
    }
};
