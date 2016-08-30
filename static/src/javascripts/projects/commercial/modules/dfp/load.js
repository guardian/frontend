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
    'commercial/modules/third-party-tags/audience-science-pql'
], function (Promise, qwery, sha1, identity, commercialFeatures, dfpEnv, Advert, queueAdvert, displayLazyAds, displayAds, refreshOnResize, audienceSciencePql) {
    return load;

    function load() {
        if (commercialFeatures.dfpAdvertising) {
            return loadAdvertising();
        }
        return Promise.resolve();
    }

    function loadAdvertising() {

        return new Promise(function(resolve) {
            window.googletag.cmd.push(
                createAdverts,
                queueAdverts,
                setPublisherProvidedId,
                dfpEnv.shouldLazyLoad() ? setAudienceScienceCallback : function() {},
                dfpEnv.shouldLazyLoad() ? displayLazyAds : displayAds,
                // anything we want to happen after displaying ads
                refreshOnResize,
                resolve);
        });
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

    // Remove all Audience Science related targeting keys as soon as we recieve
    // an AS creative (will get called by the creative itself)
    function setAudienceScienceCallback() {
        window.onAudienceScienceCreativeLoaded = function () {
            var pubads = window.googletag.pubads();
            Object.keys(audienceSciencePql.getSegments()).forEach(removeKey);
            function removeKey(key) {
                pubads.clearTargeting(key);
            }
        };
    }
});
