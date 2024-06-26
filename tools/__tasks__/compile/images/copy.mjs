import path from 'node:path';
import cpy from 'cpy';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Copy images',
	task: () =>
		cpy(['**/*'], path.resolve(paths.target, 'images'), {
			cwd: path.resolve(paths.public, 'images'),
			parents: true,
			nodir: true,
		}),
};

export default task;
