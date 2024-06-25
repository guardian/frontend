const clean = require('./clean.js');
const mkdir = require('./mkdir.js');
const images = require('../images/index.js');
const sass = require('./sass.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile CSS',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				mkdir,
				images,
				sass,
			],
			{ concurrent: false },
		),
};

module.exports = task;
