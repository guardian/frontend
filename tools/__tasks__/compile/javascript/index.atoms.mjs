import clean from './clean.mjs';
import inlineSVGs from '../inline-svgs/index.mjs';
import webpackAtoms from './webpack-atoms.mjs';

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

export default task;
