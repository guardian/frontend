const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear CSS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'stylesheets'));
		rimraf.sync(path.resolve(paths.hash, 'stylesheets'));
	},
};

module.exports = task;
