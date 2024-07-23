import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear JS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'javascripts'));
		rimraf.sync(path.resolve(paths.hash, 'javascripts'));
	},
};

export default task;
