const task = {
	description: 'Lint assets',
	task: [
		// prettier: multi-line
		require('./javascript'),
		require('./typescript'),
		require('./sass'),
		require('./check-for-disallowed-strings'),
	],
	concurrent: true,
};

module.exports = task;
