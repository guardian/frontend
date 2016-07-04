define([
    'Promise',
    'common/modules/commercial/dfp/private/dfp-env'
], function (Promise, dfpEnv) {
    dfpEnv.fn.startLoadingAdvert = startLoadingAdvert;
    dfpEnv.fn.stopLoadingAdvert = stopLoadingAdvert;
    dfpEnv.fn.startRenderingAdvert = startRenderingAdvert;
    dfpEnv.fn.stopRenderingAdvert = stopRenderingAdvert;
    return createAdvert;

    function createAdvert(adSlotNode) {
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
            whenRenderedResolver: null
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
        return Object.seal(advert);
    }

    function startLoadingAdvert(advert) {
        advert.isLoading = true;
    }

    function stopLoadingAdvert(advert, isLoaded) {
        advert.isLoading = false;
        advert.whenLoadedResolver(isLoaded);
    }

    function startRenderingAdvert(advert) {
        advert.isRendering = true;
    }

    function stopRenderingAdvert(advert, isRendered) {
        advert.isRendering = false;
        advert.whenRenderedResolver(isRendered);
    }
});
