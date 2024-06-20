import { resolve } from 'path';
import rimraf from 'rimraf';

import { paths } from '../../config.mjs';
const { hash } = paths;

export default {
	description: 'Clear asset hash artefacts',
	task: () => {
		return rimraf.sync(resolve(hash, 'assets'));
	},
};
