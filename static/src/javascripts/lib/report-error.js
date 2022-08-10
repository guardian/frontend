/*
        Report errors to Sentry with optional tags metadata.
        We optionally re-throw the error to halt execution and to ensure the error
    is still logged to the console via browsers built-in logging for uncaught
    exceptions. This is optional because sometimes we log errors for tracking
    user data.
        A sample rate is for when an error is anticipated to be reported highly frequently
    to the point where we may encroach on our rate limits. A rate of 0.1 will report 1 in every
    10 errors. A rate of 0.0001 will report 1 in every 10,000 errors.
*/
import raven from './raven';

const reportError = (err, tags, shouldThrow = true, sampleRate = 1) => {
	if (!isInSample(sampleRate)) return;

	raven.captureException(err, { tags });
	if (shouldThrow) {
		// Flag to ensure it is not reported to Sentry again via global handlers
		const error = err;
		error.reported = true;
		throw error;
	}
};

const isInSample = (sampleRate) => Math.random() <= sampleRate;

export default reportError;
export { isInSample };
