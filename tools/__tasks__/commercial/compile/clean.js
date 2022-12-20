const path = require('path');
const rimraf = require('rimraf');

module.exports = {
	description: 'Clear Commercial JS build artefacts',
	task: () => {
		jsPath = path.join(
			__dirname,
			'../',
			'../',
			'../',
			'../',
			'static',
			'target',
			'javascripts',
		);
		rimraf.sync(path.resolve(jsPath, 'commercial'));
	},
};
