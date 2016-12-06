define([
    'common/utils/add-event-listener',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/lazy-load'
], function (addEventListener, dfpEnv, lazyLoad) {
    return enableLazyLoad;

    function enableLazyLoad() {
        if (!dfpEnv.lazyLoadEnabled) {
            dfpEnv.lazyLoadEnabled = true;
            addEventListener(window, 'scroll', lazyLoad, { passive: true });
            lazyLoad();
        }
    }
});
