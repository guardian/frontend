define([
    'Promise'
], function (Promise) {
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
            whenRenderedResolver: null
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
        return Object.seal(advert);
    }

    function startLoading(advert) {
        advert.isLoading = true;
    }

    function stopLoading(advert, isLoaded) {
        advert.isLoading = false;
        advert.whenLoadedResolver(isLoaded);
    }

    function startRendering(advert) {
        advert.isRendering = true;
    }

    function stopRendering(advert, isRendered) {
        advert.isRendering = false;
        advert.whenRenderedResolver(isRendered);
    }
});
