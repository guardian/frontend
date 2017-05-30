// @flow

import qwery from 'qwery';
import sha1 from 'lib/sha1';
import identity from 'common/modules/identity/api';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { Advert } from 'commercial/modules/dfp/Advert';
import queueAdvert from 'commercial/modules/dfp/queue-advert';
import { displayLazyAds } from 'commercial/modules/dfp/display-lazy-ads';
import { displayAds } from 'commercial/modules/dfp/display-ads';
import refreshOnResize from 'commercial/modules/dfp/refresh-on-resize';
import prepareSwitchTag from 'commercial/modules/dfp/prepare-switch-tag';

const createAdverts = (): void => {
    // Get all ad slots
    const adverts = qwery(dfpEnv.adSlotSelector)
        .filter(adSlot => !(adSlot.id in dfpEnv.advertIds))
        .map(adSlot => new Advert(adSlot));
    const currentLength = dfpEnv.adverts.length;
    dfpEnv.adverts = dfpEnv.adverts.concat(adverts);
    adverts.forEach((advert, index) => {
        dfpEnv.advertIds[advert.id] = currentLength + index;
    });
};

/**
 * Loop through each slot detected on the page and define it based on the data
 * attributes on the element.
 */
const queueAdverts = (): void => {
    // queue ads for load
    dfpEnv.adverts.forEach(queueAdvert);
};

const setPublisherProvidedId = (): void => {
    const user: ?Object = identity.getUserFromCookie();
    if (user) {
        const hashedId = sha1.hash(user.id);
        window.googletag.pubads().setPublisherProvidedId(hashedId);
    }
};

const fillAdvertSlots = (
    start: () => void,
    stop: () => void
): Promise<void> => {
    if (commercialFeatures.dfpAdvertising) {
        window.googletag.cmd.push(
            start,
            createAdverts,
            queueAdverts,
            setPublisherProvidedId,
            prepareSwitchTag.maybeCallSwitch,
            dfpEnv.shouldLazyLoad() ? displayLazyAds : displayAds,
            // anything we want to happen after displaying ads
            refreshOnResize,
            stop
        );
    }
    return Promise.resolve();
};

export { fillAdvertSlots };
