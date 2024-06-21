const execa = require('execa');
const split = require('split');

require('any-observable/register/rxjs-all');
const streamToObservable = require('stream-to-observable');
const rxjs = require('rxjs');
// rxjs6 operators are now packaged separately
const rxjsOperators = require('rxjs/operators');

const exec = (cmd, args, opts) => {
	const cp = execa(cmd, args, opts);

	return rxjs
		.merge(
			streamToObservable(cp.stdout.pipe(split()), { await: cp }),
			streamToObservable(cp.stderr.pipe(split()), { await: cp }),
		)
		.pipe(rxjsOperators.filter(Boolean));
};

module.exports = {
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
