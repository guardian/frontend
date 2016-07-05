define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/Advert',
    'common/modules/commercial/dfp/private/should-prebid-advert'
], function (dfpEnv, Advert, shouldPrebidAdvert) {
    return loadAdvert;

    function loadAdvert(advert) {
        Advert.startLoading(advert);
        dfpEnv.advertsToLoad.splice(dfpEnv.advertsToLoad.indexOf(advert), 1);

        if (shouldPrebidAdvert(advert)) {
            dfpEnv.prebidService.loadAdvert(advert).then(function onDisplay() {
                dfpEnv.firstAdDisplayed = true;
            });
        } else {
            window.googletag.display(advert.id);
            dfpEnv.firstAdDisplayed = true;
        }
    }
});
