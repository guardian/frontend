const path = require('path');
const cpy = require('cpy');

const paths = require('../../config');

const task = {
	description: 'Copy images',
	task: () =>
		cpy(['**/*'], path.resolve(paths.target, 'images'), {
			cwd: path.resolve(paths.public, 'images'),
			parents: true,
			nodir: true,
		}),
};

module.exports = task;
