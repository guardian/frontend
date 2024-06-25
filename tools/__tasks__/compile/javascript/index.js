const clean = require('./clean.js');
const inlineSVGs = require('../inline-svgs/index.js');
const copy = require('./copy.js');
const webpack = require('./webpack.js');
const webpackAtoms = require('./webpack-atoms.js');
const bundlePolyfills = require('./bundle-polyfills.js');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile JS',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				inlineSVGs,
				copy,
				webpack,
				webpackAtoms,
				bundlePolyfills,
			],
			{ concurrent: false },
		),
};

module.exports = task;
