const task = {
	description: 'Compile assets for template rendering in Play',
	task: [
		// prettier: multi-line
		require('./copy'),
		require('../inline-svgs'),
	],
};

module.exports = task;
