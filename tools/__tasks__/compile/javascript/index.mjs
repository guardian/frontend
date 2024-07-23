import clean from './clean.mjs';
import inlineSVGs from '../inline-svgs/index.mjs';
import copy from './copy.mjs';
import webpack from './webpack.mjs';
import webpackAtoms from './webpack-atoms.mjs';
import bundlePolyfills from './bundle-polyfills.mjs';

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

export default task;
