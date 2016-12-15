define([
    'common/utils/mediator',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/lazy-load',
    'commercial/modules/dfp/load-advert',
    'commercial/modules/dfp/performance-logging'
], function (mediator, dfpEnv, lazyLoad, loadAdvert, performanceLogging) {
    /* observer: IntersectionObserver?. The observer used to detect when ad slots enter the viewport */
    var observer = null;

    /* advertsToInstantlyLoad: Array<String>. IDs of ad slots we don't want to lazy load */
    var advertsToInstantlyLoad = [
        'dfp-ad--pageskin-inread',
        'dfp-ad--merchandising-high',
        'dfp-ad--im'
    ];

    return enableLazyLoad;

    function enableLazyLoad(advert) {
        if (!dfpEnv.lazyLoadEnabled) {
            instantLoad();
            dfpEnv.lazyLoadEnabled = true;
            if (dfpEnv.lazyLoadObserve) {
                observer = new IntersectionObserver(lazyLoad, { rootMargin: '200px 0%' });
                dfpEnv.advertsToLoad.forEach(function (advert) {
                    observer.observe(advert.node);
                });
            } else {
                mediator.on('window:throttledScroll', lazyLoad);
                lazyLoad();
            }
        } else if (dfpEnv.lazyLoadObserve && advert) {
            observer.observe(advert.node);
        }
    }

    function instantLoad() {
        var instantLoadAdverts = dfpEnv.advertsToLoad.filter(function(advert) {
            if (advertsToInstantlyLoad.indexOf(advert.id) > -1) {
                performanceLogging.updateAdvertMetric(advert, 'loadingMethod', 'instant');
                performanceLogging.updateAdvertMetric(advert, 'lazyWaitComplete', 0);
                return true;
            } else {
                performanceLogging.updateAdvertMetric(advert, 'loadingMethod', 'lazy-load');
                return false;
            }
        });

        dfpEnv.advertsToLoad = dfpEnv.advertsToLoad.filter(function (advert) {
            return advertsToInstantlyLoad.indexOf(advert.id) < 0;
        });

        instantLoadAdverts.forEach(loadAdvert);
    }
});
