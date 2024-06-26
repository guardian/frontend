const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear image build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.src, 'stylesheets', 'icons'));
		rimraf.sync(path.resolve(paths.target, 'images'));
		rimraf.sync(path.resolve(paths.hash, 'images'));
	},
};

module.exports = task;
