import path from 'node:path';
import fs from 'node:fs';

import glob from 'glob';
import pify from 'pify';

const readFile = pify(fs.readFile);
const stat = pify(fs.stat);

import { paths } from '../../config.mjs';

const srcDir = path.resolve(paths.src);

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Prohibit inline data URIs in svgs and other unoptimised things',
	task: () =>
		Promise.all(
			glob.sync('**/*.svg', { cwd: srcDir }).map((svgPath) =>
				Promise.all([
					stat(path.resolve(srcDir, svgPath)).then(
						(fileStats) =>
							new Promise((resolve, reject) => {
								if (fileStats.size > 136 * 1000) {
									reject(
										new Error(
											`whooahh ${svgPath} is much too large at ${
												fileStats.size / 1000
											}kB`,
										),
									);
								}
								resolve();
							}),
					),
					readFile(path.resolve(srcDir, svgPath), 'utf-8').then(
						(fileData) =>
							new Promise((resolve, reject) => {
								if (fileData.includes(';base64,')) {
									reject(
										new Error(
											`base64 encoded data detected in ${svgPath}`,
										),
									);
								}
								resolve();
							}),
					),
				]),
			),
		),
};

export default task;
