import mediator from 'common/utils/mediator';

var analyticsReady = false;

mediator.on('analytics:ready', function() {
    analyticsReady = true;
});

function deferToAnalytics(afterAnalytics) {
    if (analyticsReady) {
        afterAnalytics();
    } else {
        mediator.on('analytics:ready', function() {
            afterAnalytics();
        });
    }
}

export default deferToAnalytics; // define
