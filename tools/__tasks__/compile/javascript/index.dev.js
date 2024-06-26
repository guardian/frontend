const inlineSVGs = require('../inline-svgs/index.js');
const clean = require('./clean.js');
const copy = require('./copy.js');
const webpack = require('./webpack.dev.js');
const bundlePolyfills = require('./bundle-polyfills.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Prepare JS for development',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				inlineSVGs,
				clean,
				copy,
				webpack,
				bundlePolyfills,
			],
			{ concurrent: false },
		),
};

module.exports = task;
