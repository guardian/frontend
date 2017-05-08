define([
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/Advert'
], function (dfpEnv, Advert) {
    return loadAdvert;

    function loadAdvert(advert) {
        advert.whenSlotReady
            .catch(function(){
                // The display needs to be called, even in the event of an error.
            })
            .then(function() {
                Advert.startLoading(advert);
                window.googletag.display(advert.id);
            });
    }
});
