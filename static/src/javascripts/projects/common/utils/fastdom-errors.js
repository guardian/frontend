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
        console.error("Error within fastdom", error);
        raven.captureException(error, {
            tags: {
                feature: 'fastdom'
            }
        });
    };
});
