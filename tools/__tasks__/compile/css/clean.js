const path = require('path');
const {target, hash} = require('../../config').paths;

module.exports = {
    description: 'Clear CSS build artefacts',
    task: `rm -rf ${path.resolve(target, 'stylesheets')} ${path.resolve(hash, 'stylesheets')}`
};
