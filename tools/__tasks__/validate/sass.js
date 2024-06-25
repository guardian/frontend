const execa = require('execa');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Lint Sass',
	task: () => execa('stylelint', ['**/*.scss']),
};

module.exports = task;
