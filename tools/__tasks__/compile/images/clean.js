const path = require('path');
const {target, hash, src} = require('../../config').paths;

module.exports = {
    description: 'Clear image build artefacts',
    task: `rm -rf ${path.resolve(src, 'stylesheets', 'icons')} ${path.resolve(target, 'images')} ${path.resolve(hash, 'images')}`
};
