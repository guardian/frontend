const path = require('path');
const {hash} = require('../../config').paths;

module.exports = {
    description: 'Clear asset hash artefacts',
    task: `rm -rf ${path.resolve(hash, 'assets')}`
};
