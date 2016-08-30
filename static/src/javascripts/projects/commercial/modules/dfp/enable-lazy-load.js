define([
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/lazy-load'
], function (dfpEnv, lazyLoad) {
    return enableLazyLoad;

    function enableLazyLoad() {
        if (!dfpEnv.lazyLoadEnabled) {
            dfpEnv.lazyLoadEnabled = true;
            window.addEventListener('scroll', lazyLoad);
            lazyLoad();
        }
    }
});
