const path = require('path');
const {target, hash} = require('../../config').paths;

module.exports = {
    description: 'Clear JS build artefacts',
    task: `rm -rf ${path.resolve(target, 'javascripts')} ${path.resolve(hash, 'javascripts')}`
};
