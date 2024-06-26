const clean = require('./conf/clean.js');
const css = require('./css/index.js');
const data = require('./data/index.js');
const javascript = require('./javascript/index.js');
const hash = require('./hash/index.js');
const conf = require('./conf/index.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile assets for production',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				css,
				data,
				javascript,
				hash,
				conf,
			],
			{ concurrent: false },
		),
};

module.exports = task;
