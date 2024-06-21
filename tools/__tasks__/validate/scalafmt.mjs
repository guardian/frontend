import chalk from 'chalk';
const config = '--error';

const error = (ctx) => {
	ctx.messages.push(
		`Run ${chalk.blue('./sbt scalafmt')} to format Scala files.`,
	);
};

export default {
	description: 'scalafmt check',
	task: [
		{
			description: 'scalafmtCheckAll',
			task: `./sbt scalafmtCheckAll ${config}`,
			onError: error,
		},
	],
};
