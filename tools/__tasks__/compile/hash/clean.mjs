import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear asset hash artefacts',
	task: () => rimraf.sync(path.resolve(paths.hash, 'assets')),
};

export default task;
