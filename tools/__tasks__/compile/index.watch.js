const task = {
	description: 'Compile assets for development',
	task: [
		// prettier: multi-line
		require('./conf/clean'),
		require('./css/index.dev'),
		require('./data/index.watch'),
		require('./javascript/index.watch'),
		require('./conf'),
	],
};

module.exports = task;
