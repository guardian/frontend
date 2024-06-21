import path from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';
const { root } = paths;

export default {
	description: 'Clear template rendering artefacts',
	task: () => rimraf.sync(path.resolve(root, 'common', 'conf', 'assets')),
};
