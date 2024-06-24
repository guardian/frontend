const task = {
	description: 'Compile assets for production',
	task: [
		// prettier: multi-line
		require('./conf/clean'),
		require('./css'),
		require('./data'),
		require('./javascript'),
		require('./hash'),
		require('./conf'),
	],
};

module.exports = task;
