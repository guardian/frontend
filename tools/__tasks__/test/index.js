const task = {
	description: 'Test assets',
	task: [
		// prettier: multi-line
		require('../compile/data'),
		require('./javascript'),
	],
	concurrent: true,
};

module.exports = task;
