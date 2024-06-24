const path = require('path');
const cpy = require('cpy');

const { paths } = require('../../config');

const task = {
	description: 'Copy assets',
	task: () =>
		Promise.all([
			cpy('curl.js', paths.conf, {
				cwd: path.resolve(
					path.dirname(require.resolve('curl')),
					'..',
					'dist',
					'curl-with-js-and-domReady',
				),
			}),
			cpy(
				['**/head*.css', 'inline/**/*.css'],
				path.resolve(paths.conf, 'inline-stylesheets'),
				{
					cwd: path.resolve(paths.target, 'stylesheets'),
				},
			),
			cpy(['**/assets.map'], path.resolve(paths.conf), {
				cwd: path.resolve(hash, 'assets'),
			}),
			cpy(['polyfill.io'], path.resolve(paths.conf), {
				cwd: path.resolve(src, 'javascripts'),
			}),
		]),
};

module.exports = task;
