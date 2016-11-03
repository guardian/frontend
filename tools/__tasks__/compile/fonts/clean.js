const path = require('path');
const {target, hash} = require('../../config').paths;

module.exports = {
    description: 'Clear font build artefacts',
    task: `rm -rf ${path.resolve(target, 'fonts')} ${path.resolve(hash, 'fonts')}`
};
