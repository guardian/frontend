import execa from 'execa';
import split from 'split';
import streamToObservable from 'stream-to-observable';
import { merge } from 'rxjs';
// rxjs6 operators are now packaged separately
import { filter } from 'rxjs/operators';

const exec = (cmd, args, opts) => {
	const cp = execa(cmd, args, opts);

	return merge(
		streamToObservable(cp.stdout.pipe(split()), { await: cp }),
		streamToObservable(cp.stderr.pipe(split()), { await: cp }),
	).pipe(filter(Boolean));
};

export default {
	description: 'Test JS app',
	task: [
		{
			description: 'Run tests',
			task: [
				{
					description: 'JS tests',
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
			concurrent: true,
		},
	],
};
