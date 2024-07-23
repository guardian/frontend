import javascript from './javascript.mjs';
import sass from './sass.mjs';
import scala from './scala.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Validate commits',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				javascript,
				sass,
				scala,
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

export default task;
