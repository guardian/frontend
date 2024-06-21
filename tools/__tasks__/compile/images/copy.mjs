import path from 'node:path';
import cpy from 'cpy';
import { paths } from '../.././config.mjs';

export default {
	description: 'Copy images',
	task: () =>
		cpy(['**/*'], path.resolve(paths.target, 'images'), {
			cwd: path.resolve(paths.public, 'images'),
			parents: true,
			nodir: true,
		}),
};
