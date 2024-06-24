const path = require('path');
const rimraf = require('rimraf');

const { paths } = require('../../config');

const task = {
	description: 'Clear image build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.src, 'stylesheets', 'icons'));
		rimraf.sync(path.resolve(paths.target, 'images'));
		rimraf.sync(path.resolve(paths.hash, 'images'));
	},
};

module.exports = task;
