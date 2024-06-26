const compile = require('../../../compile-css');

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Compile Sass',
	task: (ctx, task) =>
		task.newListr(
			[
				{
					title: 'Old IE',
					task: () =>
						compile('old-ie.*.scss', {
							browsers: 'Explorer 8',
							remify: false,
						}),
				},
				{
					title: 'IE9',
					task: () =>
						compile('ie9.*.scss', {
							browsers: 'Explorer 9',
						}),
				},
				{
					title: 'Email',
					task: () =>
						compile('head.email-{article,front}.scss', {
							remify: false,
						}),
				},
				{
					title: 'Modern',
					task: () =>
						compile(
							'!(_|ie9|old-ie|*email-article|*email-front)*.scss',
						),
				},
				{
					title: 'Inline',
					task: () => compile('inline/*.scss'),
				},
				{
					title: 'Atoms',
					task: () => compile('atoms/*.scss'),
				},
			],
			{ concurrent: !!ctx.verbose ? false : true },
		),
};

module.exports = task;
