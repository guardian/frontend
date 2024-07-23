import data from '../compile/data/index.mjs';
import javascript from './javascript/index.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Test assets',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				data,
				javascript,
			],
			{
				concurrent: false,
			},
		),
};

export default task;
