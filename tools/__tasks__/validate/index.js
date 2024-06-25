const javascript = require('./javascript.js');
const typescript = require('./typescript.js');
const sass = require('./sass.js');
const checkForDisallowedStrings = require('./check-for-disallowed-strings.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Lint assets',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				javascript,
				typescript,
				sass,
				checkForDisallowedStrings,
			],
			{
				concurrent: !!ctx.verbose ? false : true,
			},
		),
};

module.exports = task;
