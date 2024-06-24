const task = {
	description: 'Compile CSS',
	task: [
		// prettier: multi-line
		require('./clean'),
		require('./mkdir'),
		require('../images'),
		require('./sass'),
	],
};

module.exports = task;
