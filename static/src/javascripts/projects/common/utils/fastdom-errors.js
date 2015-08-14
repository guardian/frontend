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
        });
    };
});
