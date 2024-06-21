import { stdout } from 'execa';
import chalk from 'chalk';
import disallowedStrings from '../../../disallowed-strings.mjs';

export const description = 'Check for disallowed strings';
export function task() {
	return Promise.all(
		disallowedStrings.map(({ regex, message, maxOccurrences, pathspecs }) =>
			stdout('git', [
				'grep',
				'-Ein',
				'--color',
				regex.source,
				...pathspecs,
			])
				.then((matches) => matches.split('\n'))
				.then((matches) => {
					if (matches.length > maxOccurrences) {
						const msg = [
							chalk.red(
								`More than ${maxOccurrences} match for regex ${regex.source}`,
							),
							chalk.red(message),
							...matches,
						].join('\n');

						const err = new Error();
						err.stdout = msg;
						throw err;
					}
				})
				.catch((err) => {
					// git grep returns with error code 1 when there are no matches.
					// For us, this is not actually an error state so we swallow the
					// error by returning a fake resolved Promise.
					if (
						err.code === 1 &&
						err.stdout === '' &&
						err.stderr === ''
					) {
						return Promise.resolve();
					}

					// In all other cases, assume it's a real error
					return Promise.reject(err);
				}),
		),
	);
}
export const concurrent = true;
