import path from 'node:path';
import rimraf from 'rimraf';
import { paths } from '../.././config.mjs';

const { target, hash } = paths;

export default {
	description: 'Clear CSS build artefacts',
	task: () => {
		rimraf.sync(path.resolve(target, 'stylesheets'));
		rimraf.sync(path.resolve(hash, 'stylesheets'));
	},
};
