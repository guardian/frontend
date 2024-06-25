import clean from './conf/clean.mjs';
import css from './css/index.dev.mjs';
import data from './data/index.watch.mjs';
import javascript from './javascript/index.watch.mjs';
import conf from './conf/index.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile assets for development',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				css,
				data,
				javascript,
				conf,
			],
			{ concurrent: false },
		),
};

export default task;
