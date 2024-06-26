const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear Data build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'data'));
		rimraf.sync(path.resolve(paths.hash, 'data'));
	},
};

module.exports = task;
