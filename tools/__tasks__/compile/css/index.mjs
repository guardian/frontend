import clean from './clean.mjs';
import mkdir from './mkdir.mjs';
import images from '../images/index.mjs';
import sass from './sass.mjs';

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

export default task;
