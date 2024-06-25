import execa from 'execa';
import split from 'split';

require('any-observable/register/rxjs-all');
import streamToObservable from 'stream-to-observable';
import rxjs from 'rxjs';
// rxjs6 operators are now packaged separately
import rxjsOperators from 'rxjs/operators';

const exec = (cmd, args, opts) => {
	const cp = execa(cmd, args, opts);

	return rxjs
		.merge(
			streamToObservable(cp.stdout.pipe(split()), { await: cp }),
			streamToObservable(cp.stderr.pipe(split()), { await: cp }),
		)
		.pipe(rxjsOperators.filter(Boolean));
};

/** @type {import('listr2').ListrTask} */
const task = {
	title: 'Test JS app',
	task: (ctx, task) =>
		task.newListr([
			{
				title: 'Run tests',
				task: (ctx, task) =>
					task.newListr(
						[
							{
								title: 'JS tests',
								task: () =>
									exec('jest', null, {
										env: {
											/**
											 * We test some things like relative dates and formatting
											 * that rely on a specific timezone. We set this here so
											 * that it's not determined by the machine's timezone.
											 */
											TZ: 'Europe/London',
										},
									}),
							},
						],
						{ concurrent: !!ctx.verbose ? false : true },
					),
			},
		]),
};

export default task;
