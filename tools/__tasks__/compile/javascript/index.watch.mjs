import inlineSVGs from '../inline-svgs/index.mjs';
import clean from './clean.mjs';
import copy from './copy.mjs';
import bundlePolyfills from './bundle-polyfills.mjs';

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
				bundlePolyfills,
			],
			{ concurrent: false },
		),
};

export default task;
