define([
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/load-advert'
], function (dfpEnv, loadAdvert) {
    return displayAds;

    function displayAds() {
        window.googletag.pubads().enableSingleRequest();
        window.googletag.pubads().collapseEmptyDivs();
        window.googletag.enableServices();
        // as this is an single request call, only need to make a single display call (to the first ad
        // slot)
        loadAdvert(dfpEnv.advertsToLoad[0]);
        dfpEnv.advertsToLoad.length = 0;
    }
});
