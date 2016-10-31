define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/fastdom-promise',
    'raven',
    'Promise',
    'common/modules/video/events'
], function (
    bean,
    bonzo,
    fastdom,
    fastdomPromise,
    raven,
    Promise,
    events
) {

    function track(event) {
        console.log("Tracking: " + event);
    }

    return {
        track: track
    };

});
