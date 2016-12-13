define([
    'common/utils/add-event-listener',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/lazy-load'
], function (addEventListener, dfpEnv, lazyLoad) {
    /* observer: IntersectionObserver?. The observer used to detect when ad slots enter the viewport */
    var observer = null;

    return enableLazyLoad;

    function enableLazyLoad(advert) {
        if (!dfpEnv.lazyLoadEnabled) {
            dfpEnv.lazyLoadEnabled = true;
            if (dfpEnv.lazyLoadObserve) {
                observer = new IntersectionObserver(lazyLoad, { rootMargin: '200px 0%' });
                dfpEnv.adverts.forEach(function (advert) {
                    observer.observe(advert.node);
                });
            } else {
                addEventListener(window, 'scroll', lazyLoad, { passive: true });
                lazyLoad();
            }
        } else if (dfpEnv.lazyLoadObserve && advert) {
            observer.observe(advert.node);
        }
    }
});
