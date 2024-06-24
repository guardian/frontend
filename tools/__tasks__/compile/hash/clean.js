const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

const task = {
	description: 'Clear asset hash artefacts',
	task: () => rimraf.sync(path.resolve(paths.hash, 'assets')),
};

module.exports = task;
