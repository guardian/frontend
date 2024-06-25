const data = require('../compile/data/index.js');
const javascript = require('./javascript/index.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Test assets',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				data,
				javascript,
			],
			{
				concurrent: false,
			},
		),
};

module.exports = task;
