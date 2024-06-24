const task = {
	description: 'Validate commits',
	task: [
		// prettier: multi-line
		require('./javascript'),
		require('./sass'),
	],
	concurrent: true,
};

module.exports = task;
