define([
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/Advert'
], function (dfpEnv, Advert) {
    return loadAdvert;

    function loadAdvert(advert) {
        Advert.startLoading(advert);
        window.googletag.display(advert.id);
        dfpEnv.firstAdDisplayed = true;
    }
});
