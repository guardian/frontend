define([
    'bean',
    'bonzo',
    'fastdom',
    'common/utils/fastdom-promise',
    'raven',
    'Promise'
], function (
    bean,
    bonzo,
    fastdom,
    fastdomPromise,
    raven,
    Promise
) {

    function track(id, event) {
        console.log(id + " " + event);
    }

    return {
        track: track
    };


});
