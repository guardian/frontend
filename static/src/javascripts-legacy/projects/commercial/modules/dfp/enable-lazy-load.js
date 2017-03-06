define([
    'lib/mediator',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/lazy-load'
], function (mediator, dfpEnv, lazyLoad) {
    /* observer: IntersectionObserver?. The observer used to detect when ad slots enter the viewport */
    var observer = null;

    return enableLazyLoad;

    function enableLazyLoad(advert) {
        if (!dfpEnv.lazyLoadEnabled) {
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
});
