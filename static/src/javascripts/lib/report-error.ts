import raven from './raven';

type FrontendError = (Error & { reported?: boolean }) | string;

const convertError = (err: unknown): Error => {
	if (err instanceof Error) {
		return err;
	}
	if (typeof err === 'string') {
		return new Error(err);
	}
	return new Error(String(err));
};

/**
 * Report errors to Sentry with optional tags metadata.
 * @param err - An error object or string.
 * @param tags - Tags to assign to the event.
 * @param shouldThrow - Flag to optionally re-throw the error (true by default). This halts
 *  execution to ensure the error is still logged to the console via browsers' built-in logging
 *  for uncaught exceptions. This is optional because sometimes we log errors for tracking
 *  non-error data.
 * @param sampleRate - A sampling rate to apply to events, used for highly frequent errors.
 *  A value of 0 will send no events, and a value of 1 (default) will send an event for
 *  users that have downloaded the raven client (0.8% of all users).
 *  See https://github.com/guardian/frontend/blob/faf2bb4f5e4aa123d1da86ea98cbd693c4e8ffd0/static/src/javascripts/lib/raven.ts#L68
 */
const reportError = (
	err: unknown,
	tags: Record<string, string>,
	shouldThrow = true,
	sampleRate = 1,
): void => {
	const localError: FrontendError = convertError(err);
	if (sampleRate >= Math.random()) {
		raven.captureException(localError, { tags });
	}
	if (shouldThrow) {
		localError.reported = true;
		throw localError;
	}
};

export { convertError, reportError };
