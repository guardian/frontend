import Promise from 'Promise';
import qwery from 'qwery';
import sha1 from 'lib/sha1';
import identity from 'common/modules/identity/api';
import commercialFeatures from 'commercial/modules/commercial-features';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import Advert from 'commercial/modules/dfp/Advert';
import queueAdvert from 'commercial/modules/dfp/queue-advert';
import displayLazyAds from 'commercial/modules/dfp/display-lazy-ads';
import displayAds from 'commercial/modules/dfp/display-ads';
import refreshOnResize from 'commercial/modules/dfp/refresh-on-resize';
import prepareSwitchTag from 'commercial/modules/dfp/prepare-switch-tag';

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
        .filter(function(adSlot) {
            return !(adSlot.id in dfpEnv.advertIds);
        })
        .map(Advert);
    var currentLength = dfpEnv.adverts.length;
    dfpEnv.adverts = dfpEnv.adverts.concat(adverts);
    adverts.forEach(function(advert, index) {
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

export default {
    init: init
};
