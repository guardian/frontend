const path = require('path');
const {root} = require('../../config').paths;

module.exports = {
    description: 'Clear template rendering artefacts',
    task: `rm -rf ${path.resolve(root, 'common', 'conf', 'assets')}`
};
