/*
        Report errors to Sentry with optional tags metadata.
        We optionally re-throw the error to halt execution and to ensure the error
    is still logged to the console via browsers built-in logging for uncaught
    exceptions. This is optional because sometimes we log errors for tracking
    user data.
        A sample rate is used for highly frequent errors, where logging every
    one to Sentry may cause us to reach rate limits.
*/
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

const reportError = (
	err: unknown,
	tags: Record<string, string>,
	shouldThrow = true,
): void => {
	const localError: FrontendError = convertError(err);
	raven.captureException(localError, { tags });
	if (shouldThrow) {
		// Flag to ensure it is not reported to Sentry again via global handlers
		localError.reported = true;
		throw localError;
	}
};

export { convertError, reportError };
