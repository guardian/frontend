const path = require('path');
const cpy = require('cpy');

const { paths } = require('../../config');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Copy 3rd JS party libraries',
	task: () =>
		Promise.all([
			cpy(
				[
					'formstack-interactive/**/*',
					'prebid_safeframe.js',
					'polyfillio.minimum.fallback.js',
					'omsdk-v1.js',
				],
				path.resolve(paths.target, 'javascripts', 'vendor'),
				{
					cwd: path.resolve(paths.vendor, 'javascripts'),
					parents: true,
					nodir: true,
				},
			),
		]),
};

module.exports = task;
