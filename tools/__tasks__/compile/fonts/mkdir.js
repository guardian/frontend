const mkdirp = require('mkdirp');
const {target} = require('../../config').paths;

module.exports = {
    description: 'Create fonts target directory',
    task: () => mkdirp.sync(`${target}/fonts`)
};
