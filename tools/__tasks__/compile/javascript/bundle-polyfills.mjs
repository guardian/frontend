import path from 'node:path';
import fs from 'node:fs';

import mkdirp from 'mkdirp';
import pify from 'pify';
import uglify from 'uglify-js';

const readFileP = pify(fs.readFile);
const writeFileP = pify(fs.writeFile);

import { paths } from '../../config.mjs';

const dest = path.resolve(paths.target, 'javascripts', 'vendor');
const polyfillURL = fs
	.readFileSync(path.resolve(paths.src, 'javascripts', 'polyfill.io'), 'utf8')
	.trim();

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Bundle polyfill.io fallback',
	task: () => {
		mkdirp.sync(dest);
		// try and get the lastest result from polyfill.io
		// gobbledegook UA means it will return *all* polyfills, so this
		// strictly a worst-case fallback
		return (
			fetch(`${polyfillURL}&ua=qwerty&unknown=polyfill`)
				.then((res) => res.text())
				.then((body) => {
					// make sure the response looks about right
					if (body.endsWith('guardianPolyfilled();')) {
						return body;
					}
					return Promise.reject();
				})
				// if that fails, just use our checked in version.
				// it's probably the same, but this should mean our fallback is
				// always as up to date as possible...
				.catch(() =>
					readFileP(
						path.resolve(
							paths.vendor,
							'javascripts',
							'polyfillio.fallback.js',
						),
						'utf8',
					).then(
						(polyfills) =>
							uglify.minify(polyfills, { fromString: true }).code,
					),
				)
				.then((polyfills) =>
					writeFileP(
						path.resolve(dest, 'polyfillio.fallback.js'),
						polyfills,
					),
				)
		);
	},
};
export default task;
