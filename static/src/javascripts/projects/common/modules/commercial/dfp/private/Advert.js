define([
    'Promise',
    'common/modules/commercial/dfp/private/ophan-tracking'

], function (Promise, ophanTracking) {
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
            advert.isLoaded = isLoaded;
        });
        advert.whenRendered = new Promise(function (resolve) {
            advert.whenRenderedResolver = resolve;
        }).then(function (isRendered) {
            advert.isRendered = isRendered;
        });

        if (advert.id === 'dfp-ad--inline1' ) {
            var timer = new Date().getTime();
            ophanTracking.advertCheckpoint(advert.id, "create duration : ",  timer, false);
        }

        return Object.seal(advert);
    }

    function startLoading(advert) {
        advert.isLoading = true;

        if (advert.id === 'dfp-ad--inline1' ) {
            var timer = new Date().getTime();
            ophanTracking.addBaseline("lazyLoadBaseline");
            ophanTracking.advertCheckpoint(advert.id, "startDfpCall",  timer, true );
        }
    }

    function stopLoading(advert, isLoaded) {
        advert.isLoading = false;
        advert.whenLoadedResolver(isLoaded);

         if (advert.id === 'dfp-ad--inline1' ) {
            var timer = new Date().getTime();
            ophanTracking.advertCheckpoint(advert.id,'dfp call Duration : ', timer, true );
        }
    }

    function startRendering(advert) {
        advert.isRendering = true;

        if (advert.id === 'dfp-ad--inline1' ) {
            var timer = new Date().getTime();
            ophanTracking.advertCheckpoint(advert.id,'duration to start rendering : ', timer, true );
        }
    }

    function stopRendering(advert, isRendered) {
        advert.isRendering = false;
        advert.whenRenderedResolver(isRendered);

        if (advert.id === 'dfp-ad--inline1' ) {
            var timer = new Date().getTime();
            ophanTracking.advertCheckpoint(advert.id,'duration to stop rendering : ', timer, true );
        }
    }
});
