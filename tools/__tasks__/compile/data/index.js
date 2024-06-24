const task = {
	description: 'Clean download and build data assets',
	task: [
		// prettier: multi-line
		require('./clean'),
		require('./download'),
		require('./amp'),
	],
};
module.exports = task;
