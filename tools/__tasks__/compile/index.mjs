import clean from './conf/clean.mjs';
import css from './css/index.mjs';
import data from './data/index.mjs';
import javascript from './javascript/index.mjs';
import hash from './hash/index.mjs';
import conf from './conf/index.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile assets for production',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				clean,
				css,
				data,
				javascript,
				hash,
				conf,
			],
			{ concurrent: false },
		),
};

export default task;
