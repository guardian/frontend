import path from 'node:path';
import cpy from 'cpy';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Copy 3rd JS party libraries',
	task: () =>
		Promise.all([
			cpy(
				[
					'formstack-interactive/**/*',
					'prebid_safeframe.js',
					'polyfillio.minimum.fallback.js',
					'omsdk-v1.js',
				],
				path.resolve(paths.target, 'javascripts', 'vendor'),
				{
					cwd: path.resolve(paths.vendor, 'javascripts'),
					parents: true,
					nodir: true,
				},
			),
		]),
};

export default task;
