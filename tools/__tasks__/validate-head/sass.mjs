import execa from 'execa';
import chalk from 'chalk';
import os from 'node:os';
import getChangedFiles from '../lib/get-changed-files.js';

const getCpuCount = () => os.cpus().length;

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Validate committed Sass',
	task: (ctx, task) =>
		task.newListr(
			[
				{
					title: 'Lint committed Sass',
					task: () =>
						getChangedFiles().then((files) => {
							const errors = [];
							const sassFiles = files.filter((file) =>
								file.endsWith('.scss'),
							);
							const lint = (proc, batchedFiles) =>
								proc.then(() =>
									Promise.all(
										batchedFiles.map((filePath) =>
											execa(
													`git show HEAD:${filePath} | yarn stylelint --max-warnings 0 '${filePath}'`, {shell: true}
												)
												.catch((e) => {
													errors.push(e);
												}),
										),
									),
								);
							const batch = (arr, batchSize) => {
								const batchFold = (xss, x) => {
									if (!xss.length) {
										return [[x]];
									}
									if (xss[0].length < batchSize) {
										return [
											xss[0].concat(x),
											...xss.slice(1),
										];
									}

									return [[x], ...xss];
								};

								return arr.reduce(batchFold, []);
							};

							return batch(sassFiles, getCpuCount())
								.reduce(lint, Promise.resolve())
								.then(() => {
									if (errors.length) {
										const error = errors.reduce(
											(acc, curr) => {
												acc.stdout += curr.stdout;

												return acc;
											},
											{ stdout: '' },
										);

										error.stdout += `\n${chalk.red(
											`✋  Your changes have not been pushed.`,
										)}`;

										return Promise.reject(error);
									}

									return Promise.resolve();
								});
						}),
				},
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

export default task;
