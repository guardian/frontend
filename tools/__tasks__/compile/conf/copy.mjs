import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cpy from 'cpy';

import { paths } from '../../config.mjs';

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Copy assets',
	task: () =>
		Promise.all([
			cpy('curl.js', paths.conf, {
				cwd: path.resolve(
					path.dirname(fileURLToPath(import.meta.resolve('curl'))),
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
				cwd: path.resolve(paths.hash, 'assets'),
			}),
			cpy(['polyfill.io.txt'], path.resolve(paths.conf), {
				cwd: path.resolve(paths.src, 'javascripts'),
				rename: 'polyfill.io',
			}),
		]),
};

export default task;
