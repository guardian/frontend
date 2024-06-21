import mkdirp from 'mkdirp';
import { paths } from '../../config.mjs';

const { target } = paths;

export default {
	description: 'Create CSS target directory',
	task: () => mkdirp.sync(`${target}/stylesheets`),
};
