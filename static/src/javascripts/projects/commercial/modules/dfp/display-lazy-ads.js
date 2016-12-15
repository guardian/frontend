define([
    'commercial/modules/dfp/enable-lazy-load'
], function (enableLazyLoad) {
    return displayLazyAds;

    function displayLazyAds() {
        window.googletag.pubads().collapseEmptyDivs();
        window.googletag.enableServices();
        enableLazyLoad();
    }
});
