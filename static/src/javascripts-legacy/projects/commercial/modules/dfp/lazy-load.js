define([
    'fastdom',
    'lib/config',
    'lib/detect',
    'lib/mediator',
    'lib/user-timing',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/load-advert',
    'commercial/modules/dfp/performance-logging',
    'commercial/modules/dfp/get-advert-by-id'
], function (fastdom, config, detect, mediator, userTiming, dfpEnv, loadAdvert, performanceLogging, getAdvertById) {
    /* depthOfScreen: double. Top and bottom margin of the visual viewport to check for the presence of an advert */
    var depthOfScreen = 1.5;

    var lazyLoad = dfpEnv.lazyLoadObserve ? onIntersect : onScroll;

    return lazyLoad;

    function onScroll() {
        var viewportHeight = detect.getViewport().height;

        var lazyLoadAds = dfpEnv.advertsToLoad
        .filter(function (advert) {
            var rect = advert.node.getBoundingClientRect();
            var isNotHidden = rect.top + rect.left + rect.right + rect.bottom !== 0;
            var isNotTooFarFromTop = (1 - depthOfScreen) * viewportHeight < rect.bottom;
            var isNotTooFarFromBottom = rect.top < viewportHeight * depthOfScreen;
            // load the ad only if it's setting within an acceptable range
            return isNotHidden && isNotTooFarFromTop && isNotTooFarFromBottom;
        })
        .map(function (advert) {
            return advert.id;
        });

        dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(function (advert) {
            return lazyLoadAds.indexOf(advert.id) < 0;
        });

        if (dfpEnv.advertsToLoad.length === 0) {
            stopListening();
        }

        lazyLoadAds.forEach(displayAd);
    }

    function stopListening() {
        dfpEnv.lazyLoadEnabled = false;
        mediator.off('window:throttledScroll', lazyLoad);
    }

    function onIntersect(entries, observer) {
        var advertIds = [];

        entries
        .filter(function (entry) {
            return !('isIntersecting' in entry) || entry.isIntersecting;
        })
        .forEach(function (entry) {
            observer.unobserve(entry.target);
            displayAd(entry.target.id);
            advertIds.push(entry.target.id);
        });

        dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(function (advert) {
            return advertIds.indexOf(advert.id) < 0;
        });

        if (dfpEnv.advertsToLoad.length === 0) {
            stopObserving(observer);
        }
    }

    function stopObserving(observer) {
        dfpEnv.lazyLoadEnabled = false;
        observer.disconnect();
    }

    function displayAd(advertId) {
        var advert = getAdvertById(advertId);
        performanceLogging.updateAdvertMetric(advert, 'lazyWaitComplete', userTiming.getCurrentTime());
        loadAdvert(advert);
    }
});
