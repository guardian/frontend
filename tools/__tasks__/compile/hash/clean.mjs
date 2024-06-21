import { resolve } from 'node:path';
import rimraf from 'rimraf';

import { paths } from '../.././config.mjs';
const { hash } = paths;

export default {
	description: 'Clear asset hash artefacts',
	task: () => rimraf.sync(resolve(hash, 'assets')),
};
