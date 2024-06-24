const mkdirp = require('mkdirp');
const paths = require('../../config');

const task = {
	description: 'Create CSS target directory',
	task: () => mkdirp.sync(`${paths.target}/stylesheets`),
};

module.exports = task;
