const copy = require('./copy.js');
const inlineSVGs = require('../inline-svgs/index.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile assets for template rendering in Play',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				copy,
				inlineSVGs,
			],
			{ concurrent: false },
		),
};

module.exports = task;
