import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cpy from 'cpy';
import { paths } from '../.././config.mjs';

const { conf, target, hash, src } = paths;

const curl = fileURLToPath(import.meta.resolve('curl'))

export default {
	description: 'Copy assets',
	task: () =>
		Promise.all([
			cpy('curl.js', conf, {
				cwd: path.resolve(
					path.dirname(curl),
					'..',
					'dist',
					'curl-with-js-and-domReady',
				),
			}),
			cpy(
				['**/head*.css', 'inline/**/*.css'],
				path.resolve(conf, 'inline-stylesheets'),
				{
					cwd: path.resolve(target, 'stylesheets'),
				},
			),
			cpy(['**/assets.map'], path.resolve(conf), {
				cwd: path.resolve(hash, 'assets'),
			}),
			cpy(['polyfill.io'], path.resolve(conf), {
				cwd: path.resolve(src, 'javascripts'),
			}),
		]),
};
