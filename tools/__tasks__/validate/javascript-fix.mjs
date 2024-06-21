import execa from 'execa';

const config = ['--quiet', '--color', '--fix'];

const handleSuccess = (ctx) => {
	ctx.messages.push("Don't forget to commit any fixes...");
};

export const description = 'Fix JS linting errors';
export const task = [
	{
		description: 'Fix static/src',
		task: (ctx) =>
			execa(
				'eslint',
				['static/src/javascripts', '--ext=ts,tsx,js'].concat(config),
			).then(handleSuccess.bind(null, ctx)),
	},
	{
		description: 'Fix everything else',
		task: (ctx) =>
			execa(
				'eslint',
				['*.js', 'tools/**/*.js', 'dev/**/*.js', 'git-hooks/*'].concat(
					config,
				),
			).then(handleSuccess.bind(null, ctx)),
	},
];
export const concurrent = true;
