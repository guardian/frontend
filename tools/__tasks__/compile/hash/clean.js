const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear asset hash artefacts',
	task: () => rimraf.sync(path.resolve(paths.hash, 'assets')),
};

module.exports = task;
