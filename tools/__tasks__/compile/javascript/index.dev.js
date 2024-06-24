const task = {
	description: 'Prepare JS for development',
	task: [
		// prettier: multi-line
		require('../inline-svgs'),
		require('./clean'),
		require('./copy'),
		require('../../commercial/compile'),
		require('./webpack.dev'),
		require('./webpack-dcr.dev'),
		require('./bundle-polyfills'),
	],
};

module.exports = task;
