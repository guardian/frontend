const path = require('path');
const {target, hash, static: staticDir} = require('../../config').paths;

module.exports = {
    description: 'Clear image build artefacts',
    task: `rm -rf ${path.resolve(staticDir, 'stylesheets', 'icons')} ${path.resolve(target, 'images')} ${path.resolve(hash, 'images')}`
};
