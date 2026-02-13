import chalk from 'chalk';
import execa from 'execa';
const config = '--error';

const error = (ctx) => {
	ctx.messages.push(
		`Run ${chalk.blue('sbt scalafmt')} to format Scala files.`,
	);
};

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Check Scala formatting',
	task: (ctx, task) =>
		task.newListr(
			[
				{
					title: 'scalafmtCheckAll',
					task: () => execa('sbt', ['scalafmtCheckAll', config]),
					onError: error,
				},
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

export default task;
