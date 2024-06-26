const execa = require('execa');

const config = ['--quiet', '--color', '--fix'];

const handleSuccess = (ctx) => {
	ctx.messages.push("Don't forget to commit any fixes...");
};

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Fix JS linting errors',
	task: (ctx, task) =>
		task.newListr(
			[
				{
					title: 'Fix static/src',
					task: (ctx) =>
						execa(
							'eslint',
							[
								'static/src/javascripts',
								'--ext=ts,tsx,js',
							].concat(config),
						).then(handleSuccess.bind(null, ctx)),
				},
				{
					title: 'Fix everything else',
					task: (ctx) =>
						execa(
							'eslint',
							[
								'*.js',
								'tools/**/*.js',
								'dev/**/*.js',
								'git-hooks/*',
							].concat(config),
						).then(handleSuccess.bind(null, ctx)),
				},
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

module.exports = task;
