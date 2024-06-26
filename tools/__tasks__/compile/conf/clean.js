const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear template rendering artefacts',
	task: () =>
		rimraf.sync(path.resolve(paths.root, 'common', 'conf', 'assets')),
};

module.exports = task;
