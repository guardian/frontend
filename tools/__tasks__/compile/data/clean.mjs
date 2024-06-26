import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear Data build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'data'));
		rimraf.sync(path.resolve(paths.hash, 'data'));
	},
};

export default task;
