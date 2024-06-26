const clean = require('./clean.js');
const copy = require('./copy.js');
const icons = require('./icons.js');
const svg = require('./svg.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile images',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				copy,
				icons,
				svg,
			],
			{ concurrent: false },
		),
};

module.exports = task;
