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

    function onPlayerStateChange(event) {
        track(event);
    }

    function track(event) {

        if (event.data === YT.PlayerState.PLAYING) {
            console.log('Tracking: play');
        }
        if (event.data === YT.PlayerState.PAUSED) {
            console.log('Tracking: paused');
        }
        if (event.data === YT.PlayerState.ENDED) {
            console.log('Tracking: ended');
        }
    }

    return {
        onPlayerStateChange: onPlayerStateChange
    };

});
