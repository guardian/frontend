// Record errors within fastdom:
// https://github.com/wilsonpage/fastdom#exceptions

define([
    'fastdom',
    'raven'
], function (
    fastdom,
    raven
) {
    fastdom.onError = function (error) {
        raven.captureException(error, {
            tags: {
                feature: 'fastdom'
            }
        });
        // Some environments don't support or don't always expose the console object
        if (window.console && window.console.warn) {
            window.console.warn('Caught FastDom error.', error.stack);
        }
    };
});
