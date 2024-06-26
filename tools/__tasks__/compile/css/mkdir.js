const mkdirp = require('mkdirp');
const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Create CSS target directory',
	task: () => mkdirp.sync(`${paths.target}/stylesheets`),
};

module.exports = task;
