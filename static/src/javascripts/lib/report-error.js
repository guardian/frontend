// @flow

/*
   Report errors to Sentry with optional tags metadata
   We optionally re-throw the error to halt execution and to ensure the error is
   still logged to the console via browsers built-in logging for uncaught
   exceptions. This is optional because sometimes we log errors for tracking
   user data.
*/

import raven from 'lib/raven';

function reportError(
    err: Error,
    tags: Object,
    shouldThrow: Boolean = true
): void {
    raven.captureException(err, { tags });

    if (shouldThrow === true) {
        // Flag to ensure it is not reported to Sentry again via global handlers
        const error = err;
        error.reported = true;
        throw error;
    }
}

export default reportError;
