const path = require('path');
const cpy = require('cpy');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Copy images',
	task: () =>
		cpy(['**/*'], path.resolve(paths.target, 'images'), {
			cwd: path.resolve(paths.public, 'images'),
			parents: true,
			nodir: true,
		}),
};

module.exports = task;
