import clean from './clean.mjs';
import download from './download.mjs';
import amp from './amp.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clean download and build data assets',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				download,
				amp,
			],
			{ concurrent: false },
		),
};

export default task;
