const path = require('path');
const rimraf = require('rimraf');

const {root} = require('../../config').paths;

module.exports = {
    description: 'Clear template rendering artefacts',
    task: () => rimraf.sync(path.resolve(root, 'common', 'conf', 'assets'))
};
