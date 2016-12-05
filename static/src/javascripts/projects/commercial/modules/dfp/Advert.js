define([
    'Promise',
    'common/utils/user-timing',
    'commercial/modules/dfp/performance-logging'
], function (Promise, userTiming, performanceLogging) {
    Advert.startLoading = startLoading;
    Advert.stopLoading = stopLoading;
    Advert.startRendering = startRendering;
    Advert.stopRendering = stopRendering;
    return Advert;

    function Advert(adSlotNode) {
        var advert = {
            id: adSlotNode.id,
            node: adSlotNode,
            sizes: null,
            size: null,
            slot: null,
            isEmpty: null,
            isLoading: false,
            isRendering: false,
            isLoaded: false,
            isRendered: false,
            whenLoaded: null,
            whenLoadedResolver: null,
            whenRendered: null,
            whenRenderedResolver: null,
            timings: {
                createTime: null,
                startLoading: null,
                dfpFetching: null,
                dfpReceived: null,
                dfpRendered: null,
                stopLoading: null,
                startRendering: null,
                stopRendering: null,
                loadingMethod: null,
                lazyWaitComplete: null
            }
        };
        advert.whenLoaded = new Promise(function (resolve) {
            advert.whenLoadedResolver = resolve;
        }).then(function (isLoaded) {
            return advert.isLoaded = isLoaded;
        });
        advert.whenRendered = new Promise(function (resolve) {
            advert.whenRenderedResolver = resolve;
        }).then(function (isRendered) {
            return advert.isRendered = isRendered;
        });

        performanceLogging.updateAdvertMetric(advert, 'createTime', userTiming.getCurrentTime());

        return Object.seal(advert);
    }

    function startLoading(advert) {
        advert.isLoading = true;
        advert.timings.startLoading = userTiming.getCurrentTime();
    }

    function stopLoading(advert, isLoaded) {
        advert.isLoading = false;
        advert.whenLoadedResolver(isLoaded);
        advert.timings.stopLoading = userTiming.getCurrentTime();
    }

    function startRendering(advert) {
        advert.isRendering = true;
        advert.timings.startRendering = userTiming.getCurrentTime();
    }

    function stopRendering(advert, isRendered) {
        advert.isRendering = false;
        advert.whenRenderedResolver(isRendered);
        performanceLogging.updateAdvertMetric(advert, 'stopRendering', userTiming.getCurrentTime());
    }
});
