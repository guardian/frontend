import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

export default {
	description: 'Clear JS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(paths.target, 'javascripts'));
		rimraf.sync(path.resolve(paths.hash, 'javascripts'));
	},
};
