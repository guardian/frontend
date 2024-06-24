const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

const task = {
	description: 'Clear Data build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'data'));
		rimraf.sync(path.resolve(paths.hash, 'data'));
	},
};

module.exports = task;
