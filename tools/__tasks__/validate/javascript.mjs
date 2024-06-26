import chalk from 'chalk';
import execa from 'execa';

const config = '--quiet --color';

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
	title: 'Lint JS',
	task: (ctx, task) =>
		task.newListr(
			[
				{
					title: 'Static',
					task: () =>
						execa('eslint', [
							'static/src/javascripts',
							'--ext=ts,tsx,js',
							config,
						]),
					onError: error,
				},
				{
					title: 'Tools etc.',
					task: () => execa('eslint', ['tools', config]),
					onError: error,
				},
				{
					title: 'Git hooks',
					task: () => execa('eslint', ['git-hooks/*', config]),
					onError: error,
				},
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

export default task;
