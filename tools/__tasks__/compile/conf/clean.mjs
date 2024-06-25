import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear template rendering artefacts',
	task: () =>
		rimraf.sync(path.resolve(paths.root, 'common', 'conf', 'assets')),
};

export default task;
