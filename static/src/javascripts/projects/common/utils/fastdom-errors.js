// Record errors within fastdom:
// https://github.com/wilsonpage/fastdom#exceptions

define([
    'fastdom',
    'common/utils/report-error'
], function (
    fastdom,
    reportError
) {
    fastdom.onError = function (error) {
        reportError(error, {
            feature: 'fastdom'
        }, false);
        // Some environments don't support or don't always expose the console object
        if (window.console && window.console.warn) {
            window.console.warn('Caught FastDom error.', error.stack);
        }
    };
});
