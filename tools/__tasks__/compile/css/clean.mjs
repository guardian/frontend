import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear CSS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'stylesheets'));
		rimraf.sync(path.resolve(paths.hash, 'stylesheets'));
	},
};

export default task;
