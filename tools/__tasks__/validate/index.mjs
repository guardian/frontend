import javascript from './javascript.mjs';
import typescript from './typescript.mjs';
import sass from './sass.mjs';
import checkForDisallowedStrings from './check-for-disallowed-strings.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Lint assets',
	task: (ctx, task) =>
		task.newListr(
			[
				// prettier: multi-line
				javascript,
				typescript,
				sass,
				checkForDisallowedStrings,
			],
			{
				concurrent: !!ctx.verbose ? false : true,
			},
		),
};

export default task;
