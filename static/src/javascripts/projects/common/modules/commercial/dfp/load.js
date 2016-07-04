define([
    'qwery',
    'common/utils/sha1',
    'common/modules/identity/api',
    'common/modules/commercial/commercial-features',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/lazy-load',
    'common/modules/commercial/dfp/private/create-advert',
    'common/modules/commercial/dfp/private/queue-advert',
    'common/modules/commercial/dfp/private/display-lazy-ads',
    'common/modules/commercial/dfp/private/display-ads',
    'common/modules/commercial/dfp/private/refresh-on-resize'
], function (qwery, sha1, identity, commercialFeatures, dfpEnv, lazyLoad, createAdvert, queueAdvert, displayLazyAds, displayAds, refreshOnResize) {
    return load;

    function load() {
        if (commercialFeatures.dfpAdvertising) {
            loadAdvertising();
        }
    }

    function loadAdvertising() {
        createAdverts();
        window.googletag.cmd.push(
            queueAdverts,
            setPublisherProvidedId,
            lazyLoad.shouldLazyLoad() ? displayLazyAds : displayAds,
            // anything we want to happen after displaying ads
            refreshOnResize
        );
    }

    function createAdverts() {
        // Get all ad slots
        dfpEnv.adverts = qwery(dfpEnv.adSlotSelector).map(createAdvert);
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
});
