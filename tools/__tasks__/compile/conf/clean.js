const path = require('path');
const rimraf = require('rimraf');

const paths = require('../../config');

const task = {
	description: 'Clear template rendering artefacts',
	task: () =>
		rimraf.sync(path.resolve(paths.root, 'common', 'conf', 'assets')),
};

module.exports = task;
