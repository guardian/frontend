define([
    'common/utils/mediator'
], function (
    mediator
) {

    var analyticsReady = false;

    mediator.on('analytics:ready', function () {
        analyticsReady = true;
    });

    function init() {
      analyticsReady = true;
    }

    function deferToAnalytics(afterAnalytics) {
        console.log("defering to analytics");
        if (analyticsReady) {
            console.log("analytics ready");
            afterAnalytics();
        } else {
            mediator.on('analytics:ready', function () {
                afterAnalytics();
            });
        }
    }

    return {
        init: init,
        defer: deferToAnalytics
    };

}); // define
