const clean = require('./conf/clean.js');
const css = require('./css/index.dev.js');
const data = require('./data/index.dev.js');
const javascript = require('./javascript/index.dev.js');
const conf = require('./conf/index.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile assets for development',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				css,
				data,
				javascript,
				conf,
			],
			{ concurrent: false },
		),
};

module.exports = task;
