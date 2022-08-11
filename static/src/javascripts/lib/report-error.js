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

const reportError = (err, tags, shouldThrow = true, sampleRate = 1) => {
	raven.captureException(err, { tags, sampleRate });
	if (shouldThrow) {
		// Flag to ensure it is not reported to Sentry again via global handlers
		const error = err;
		error.reported = true;
		throw error;
	}
};

export default reportError;
