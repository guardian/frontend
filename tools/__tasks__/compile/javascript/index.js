const task = {
	description: 'Compile JS',
	task: [
		// prettier: multi-line
		require('./clean'),
		require('../inline-svgs'),
		require('./copy'),
		require('./webpack'),
		require('./webpack-atoms'),
		require('./bundle-polyfills'),
	],
};

module.exports = task;
