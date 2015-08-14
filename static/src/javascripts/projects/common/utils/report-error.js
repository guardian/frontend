// Report errors to Sentry with optional tags metadata
// We optionally re-throw the error to halt execution and to ensure the error is
// still logged to the console via browsers built-in logging for uncaught
// exceptions. This is optional because sometimes we log errors for tracking
// user data.
define(['raven'], function (raven) {
    return function reportError(err, meta, shouldThrow) {
        if (shouldThrow === undefined) {
            shouldThrow = true;
        }
        raven.captureException(err, {
            tags: meta
        });
        if (shouldThrow) {
            // Flag to ensure it is not reported to Sentry again via global handlers
            err.reported = true;
            throw err;
        }
    };

});
