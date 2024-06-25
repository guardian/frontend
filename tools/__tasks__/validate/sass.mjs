import execa from 'execa';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Lint Sass',
	task: () => execa('stylelint', ['**/*.scss']),
};

export default task;
