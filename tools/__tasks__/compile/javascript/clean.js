const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

const task = {
	description: 'Clear JS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'javascripts'));
		rimraf.sync(path.resolve(paths.hash, 'javascripts'));
	},
};

module.exports = task;
