const chalk = require('chalk');
const config = '--error';

const error = (ctx) => {
	ctx.messages.push(
		`Run ${chalk.blue('./sbt scalafmt')} to format Scala files.`,
	);
};

const task = {
	description: 'scalafmt check',
	task: [
		{
			description: 'scalafmtCheckAll',
			task: `./sbt scalafmtCheckAll ${config}`,
			onError: error,
		},
	],
};

module.exports = task;
