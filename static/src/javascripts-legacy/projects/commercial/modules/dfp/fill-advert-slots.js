define([
    'Promise',
    'qwery',
    'common/utils/sha1',
    'common/modules/identity/api',
    'common/modules/commercial/commercial-features',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/Advert',
    'commercial/modules/dfp/queue-advert',
    'commercial/modules/dfp/display-lazy-ads',
    'commercial/modules/dfp/display-ads',
    'commercial/modules/dfp/refresh-on-resize',
    'commercial/modules/dfp/performance-logging'
], function (Promise, qwery, sha1, identity, commercialFeatures, dfpEnv, Advert, queueAdvert, displayLazyAds, displayAds, refreshOnResize, performanceLogging) {

    function init(moduleName) {
        if (commercialFeatures.dfpAdvertising) {
            fillAdvertSlots(moduleName);
        }
        return Promise.resolve();
    }

    function fillAdvertSlots(moduleName) {

        window.googletag.cmd.push(
            moduleStart,
            createAdverts,
            queueAdverts,
            setPublisherProvidedId,
            dfpEnv.shouldLazyLoad() ? displayLazyAds : displayAds,
            // anything we want to happen after displaying ads
            refreshOnResize,
            moduleEnd
        );

        function moduleStart() {
            performanceLogging.moduleStart(moduleName);
        }

        function moduleEnd() {
            performanceLogging.moduleEnd(moduleName);
        }
    }

    function createAdverts() {
        // Get all ad slots
        dfpEnv.adverts = qwery(dfpEnv.adSlotSelector).map(Advert);
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
