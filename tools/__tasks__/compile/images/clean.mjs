import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Clear image build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.src, 'stylesheets', 'icons'));
		rimraf.sync(path.resolve(paths.target, 'images'));
		rimraf.sync(path.resolve(paths.hash, 'images'));
	},
};

export default task;
