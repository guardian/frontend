import { resolve } from 'path';
import { sync } from 'rimraf';

import { paths } from '../../config.mjs';
const { hash } = paths;

export default {
	description: 'Clear asset hash artefacts',
	task: () => {
		return sync(resolve(hash, 'assets'));
	},
};
