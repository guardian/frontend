const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear JS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'javascripts'));
		rimraf.sync(path.resolve(paths.hash, 'javascripts'));
	},
};

module.exports = task;
