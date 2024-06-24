const task = {
	description: 'Compile images',
	task: [
		// prettier: multi-line
		require('./clean'),
		require('./copy'),
		require('./icons'),
		require('./svg'),
	],
};

module.exports = task;
