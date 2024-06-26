import execa from 'execa';
import getChangedFiles from '../lib/get-changed-files.js';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Fix committed linting errors',
	task: () =>
		getChangedFiles().then((files) => {
			const jsFiles = files.filter(
				(file) =>
					file.endsWith('.js') ||
					file.endsWith('.jsx') ||
					file.startsWith('git-hooks'),
			);

			return execa('eslint', [...jsFiles, '--quiet', '--color', '--fix']);
		}),
};

export default task;
