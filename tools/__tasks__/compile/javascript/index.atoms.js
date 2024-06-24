const task = {
	description: 'Compile JS',
	task: [
		// prettier: multi-line
		require('./clean'),
		require('../inline-svgs'),
		require('./webpack-atoms'),
	],
};

module.exports = task;
