const clean = require('./clean');
const inlineSVGs = require('../inline-svgs');
const webpackAtoms = require('./webpack-atoms');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile JS',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				inlineSVGs,
				webpackAtoms,
			],
			{ concurrent: false },
		),
};

module.exports = task;
