const mkdirp = require('mkdirp');
const {target} = require('../../config').paths;

module.exports = {
    description: 'Create CSS target directory',
    task: () => mkdirp.sync(`${target}/stylesheets`)
};
