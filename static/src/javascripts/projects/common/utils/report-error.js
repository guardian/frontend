// Report errors to Sentry with optional tags metadata
// We re-throw the error to ensure the error is still logged to the console via
// browsers built-in logging for uncaught exceptions
define(['raven'], function (raven) {
    return function reportError(err, meta) {
        raven.captureException(err, {
            tags: meta
        });
        // Flag to ensure it is not reported to Sentry again via global handlers
        err.reported = true;
        throw err;
    };

});
