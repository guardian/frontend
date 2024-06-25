const chalk = require('chalk');
const execa = require('execa');

const error = (ctx) => {
	ctx.messages.push(
		`${chalk.blue('make fix')} can correct simple errors automatically.`,
	);
	ctx.messages.push(
		`Your editor may be able to catch eslint errors as you work:\n${chalk.underline(
			'http://eslint.org/docs/user-guide/integrations#editors',
		)}`,
	);
};

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile TS',
	task: (ctx, task) =>
		task.newListr(
			[
				{
					title: 'Compile',
					task: () => execa('tsc', ['--noEmit']),
					onError: error,
				},
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

module.exports = task;
