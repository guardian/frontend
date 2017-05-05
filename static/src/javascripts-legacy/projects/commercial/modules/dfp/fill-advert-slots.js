define([
    'Promise',
    'qwery',
    'lib/sha1',
    'common/modules/identity/api',
    'commercial/modules/commercial-features',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/Advert',
    'commercial/modules/dfp/queue-advert',
    'commercial/modules/dfp/display-lazy-ads',
    'commercial/modules/dfp/display-ads',
    'commercial/modules/dfp/refresh-on-resize',
    'commercial/modules/dfp/prepare-switch-tag'
], function (Promise, qwery, sha1, identity, commercialFeatures, dfpEnv, Advert, queueAdvert, displayLazyAds, displayAds, refreshOnResize, prepareSwitchTag) {

    function init(start, stop) {
        if (commercialFeatures.dfpAdvertising) {
            fillAdvertSlots(start, stop);
        }
        return Promise.resolve();
    }

    function fillAdvertSlots(start, stop) {

        window.googletag.cmd.push(
            start,
            createAdverts,
            queueAdverts,
            setPublisherProvidedId,
            prepareSwitchTag.callSwitch,
            dfpEnv.shouldLazyLoad() ? displayLazyAds.displayLazyAds : displayAds,
            // anything we want to happen after displaying ads
            refreshOnResize,
            stop
        );
    }

    function createAdverts() {
        // Get all ad slots
        var adverts = qwery(dfpEnv.adSlotSelector)
        .filter(function (adSlot) {
            return !(adSlot.id in dfpEnv.advertIds);
        })
        .map(Advert);
        var currentLength = dfpEnv.adverts.length;
        dfpEnv.adverts = dfpEnv.adverts.concat(adverts);
        adverts.forEach(function (advert, index) {
            dfpEnv.advertIds[advert.id] = currentLength + index;
        });
    }

    /**
     * Loop through each slot detected on the page and define it based on the data
     * attributes on the element.
     */
    function queueAdverts() {
        // queue ads for load
        dfpEnv.adverts.forEach(queueAdvert);
    }

    function setPublisherProvidedId() {
        var user = identity.getUserFromCookie();
        if (user) {
            var hashedId = sha1.hash(user.id);
            window.googletag.pubads().setPublisherProvidedId(hashedId);
        }
    }

    return {
        init: init
    };
});
