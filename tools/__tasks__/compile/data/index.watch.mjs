import clean from './clean.mjs';
import amp from './amp.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clean, download and build data assets (watch)',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				amp,
			],
			{ concurrent: false },
		),
};

export default task;
