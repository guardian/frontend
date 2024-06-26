import clean from './clean.mjs';
import copy from './copy.mjs';
import icons from './icons.mjs';
import svg from './svg.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile images',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				copy,
				icons,
				svg,
			],
			{ concurrent: false },
		),
};

export default task;
