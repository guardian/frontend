const javascript = require('./javascript.js');
const sass = require('./sass.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Validate commits',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				javascript,
				sass,
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

module.exports = task;
