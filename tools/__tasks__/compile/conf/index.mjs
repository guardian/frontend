import copy from './copy.mjs';
import inlineSVGs from '../inline-svgs/index.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile assets for template rendering in Play',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				copy,
				inlineSVGs,
			],
			{ concurrent: false },
		),
};

export default task;
