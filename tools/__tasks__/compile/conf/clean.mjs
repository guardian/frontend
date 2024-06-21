import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';

export default {
	description: 'Clear template rendering artefacts',
	task: () =>
		rimraf.sync(path.resolve(paths.root, 'common', 'conf', 'assets')),
};
