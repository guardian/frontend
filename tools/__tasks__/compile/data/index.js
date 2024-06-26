const clean = require('./clean.js');
const download = require('./download.js');
const amp = require('./amp.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clean download and build data assets',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				download,
				amp,
			],
			{ concurrent: false },
		),
};

module.exports = task;
