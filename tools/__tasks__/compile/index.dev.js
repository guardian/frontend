const task = {
	description: 'Compile assets for development',
	task: [
		// prettier: multi-line
		require('./conf/clean'),
		require('./css/index.dev'),
		require('./data/index.dev'),
		require('./javascript/index.dev'),
		require('./conf'),
	],
};

module.exports = task;
