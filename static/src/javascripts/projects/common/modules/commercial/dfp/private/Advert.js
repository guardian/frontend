define([
    'Promise',
    'common/utils/user-timing'

], function (Promise, userTiming) {
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
            slot: null,
            isEmpty: false,
            isLoading: false,
            isRendering: false,
            isLoaded: false,
            isRendered: false,
            whenLoaded: null,
            whenLoadedResolver: null,
            whenRendered: null,
            whenRenderedResolver: null,
            timings: {
                constructing: null,
                startLoading: null,
                dfpFetching: null,
                dfpReceived: null,
                dfpRendered: null,
                stopLoading: null,
                startRendering: null,
                stopRendering: null
            }
        };
        advert.whenLoaded = new Promise(function (resolve) {
            advert.whenLoadedResolver = resolve;
        }).then(function (isLoaded) {
            advert.isLoaded = isLoaded;
        });
        advert.whenRendered = new Promise(function (resolve) {
            advert.whenRenderedResolver = resolve;
        }).then(function (isRendered) {
            advert.isRendered = isRendered;
        });

        advert.timings.createTime = userTiming.getCurrentTime();

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
        advert.timings.stopRendering = userTiming.getCurrentTime();
    }
});
