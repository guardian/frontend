define([
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/create-advert',
    'common/modules/commercial/dfp/private/should-prebid-advert'
], function (dfpEnv, createAdvert, shouldPrebidAdvert) {
    return loadAdvert;

    function loadAdvert(advert) {
        dfpEnv.fn.startLoadingAdvert(advert);
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
