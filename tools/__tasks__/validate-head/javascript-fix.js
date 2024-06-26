const execa = require('execa');
const getChangedFiles = require('../lib/get-changed-files');

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

module.exports = task;
