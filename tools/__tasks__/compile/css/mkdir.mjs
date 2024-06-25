import mkdirp from 'mkdirp';
import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Create CSS target directory',
	task: () => mkdirp.sync(`${paths.target}/stylesheets`),
};

export default task;
