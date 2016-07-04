define([
    'fastdom',
    'lodash/functions/throttle',
    'common/utils/config',
    'common/utils/detect',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/load-advert'
], function (fastdom, throttle, config, detect, dfpEnv, loadAdvert) {
    /* nbOfFrames: integer. Number of refresh frames we want to throttle the scroll handler */
    var nbOfFrames = 6;

    /* durationOfFrame: integer. Number of miliseconds a refresh frame typically lasts */
    var durationOfFrame = 16;

    /* depthOfScreen: double. Top and bottom margin of the visual viewport to check for the presence of an advert */
    var depthOfScreen = 1.5;

    /* loadQueued: boolean. Set to true when a lazyload task is scheduled */
    var loadQueued = false;

    var lazyLoad = throttle(function () {
        var viewportHeight = detect.getViewport().height;

        if( loadQueued ) {
            return;
        }

        loadQueued = true;
        fastdom.read(function () {
            loadQueued = false;
            dfpEnv.advertsToLoad
                .filter(function (advert) {
                    var rect = advert.node.getBoundingClientRect();
                    // load the ad only if it's setting within an acceptable range
                    return (1 - depthOfScreen) * viewportHeight < rect.bottom && rect.top < viewportHeight * depthOfScreen;
                })
                .forEach(loadAdvert);
            if (dfpEnv.advertsToLoad.length === 0) {
                disableLazyLoad();
            }
        });
    }, nbOfFrames * durationOfFrame);

    function disableLazyLoad() {
        dfpEnv.lazyLoadEnabled = false;
        window.removeEventListener('scroll', lazyLoad);
    }

    return lazyLoad;
});
