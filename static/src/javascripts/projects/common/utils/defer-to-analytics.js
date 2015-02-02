define([
    'common/utils/mediator'
], function (
    mediator
) {

    var analyticsReady = false;

    mediator.on('analytics:ready', function () {
        analyticsReady = true;
    });

    function deferToAnalytics(afterAnalytics) {
        if (analyticsReady) {
            afterAnalytics();
        } else {
            mediator.on('analytics:ready', function () {
                afterAnalytics();
            });
        }
    }

    return deferToAnalytics;

}); // define
