// @flow

import qwery from 'qwery';
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { loadScript } from 'lib/load-script';
import raven from 'lib/raven';
import sha1 from 'lib/sha1';
import { session } from 'lib/storage';
import { getPageTargeting } from 'common/modules/commercial/build-page-targeting';
import { onIabConsentNotification } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { adFreeSlotRemove } from 'commercial/modules/ad-free-slot-remove';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { fillAdvertSlots } from 'commercial/modules/dfp/fill-advert-slots';
import { getUserFromCookie } from 'common/modules/identity/api';
import { onSlotLoad } from 'commercial/modules/dfp/on-slot-load';
import { onSlotRender } from 'commercial/modules/dfp/on-slot-render';
import { onSlotViewableFunction } from 'commercial/modules/dfp/on-slot-viewable';
import { onSlotVisibilityChanged } from 'commercial/modules/dfp/on-slot-visibility-changed';
import { refreshOnResize } from 'commercial/modules/dfp/refresh-on-resize';
import { init as initMessenger } from 'commercial/modules/messenger';
import { init as background } from 'commercial/modules/messenger/background';
import { init as sendClick } from 'commercial/modules/messenger/click';
import { init as disableRefresh } from 'commercial/modules/messenger/disable-refresh';
import { init as initGetPageTargeting } from 'commercial/modules/messenger/get-page-targeting';
import { init as getStyles } from 'commercial/modules/messenger/get-stylesheet';
import { init as hide } from 'commercial/modules/messenger/hide';
import { init as resize } from 'commercial/modules/messenger/resize';
import { init as scroll } from 'commercial/modules/messenger/scroll';
import { init as type } from 'commercial/modules/messenger/type';
import { init as viewport } from 'commercial/modules/messenger/viewport';

initMessenger(
    type,
    getStyles,
    initGetPageTargeting,
    resize,
    hide,
    scroll,
    viewport,
    sendClick,
    background,
    disableRefresh
);

const setDfpListeners = (): void => {
    const pubads = window.googletag.pubads();
    pubads.addEventListener('slotRenderEnded', raven.wrap(onSlotRender));
    pubads.addEventListener('slotOnload', raven.wrap(onSlotLoad));

    pubads.addEventListener('impressionViewable', onSlotViewableFunction());

    pubads.addEventListener('slotVisibilityChanged', onSlotVisibilityChanged);
    if (session.isAvailable()) {
        const pageViews = session.get('gu.commercial.pageViews') || 0;
        session.set('gu.commercial.pageViews', pageViews + 1);
    }
};

const setPageTargeting = (): void => {
    const pubads = window.googletag.pubads();
    // because commercialFeatures may export itself as {} in the event of an exception during construction
    const targeting = getPageTargeting();
    Object.keys(targeting).forEach(key => {
        pubads.setTargeting(key, targeting[key]);
    });
};

// This is specifically a separate function to close-disabled-slots. One is for
// closing hidden/disabled slots, the other is for graceful recovery when prepare-googletag
// encounters an error. Here, slots are closed unconditionally.
const removeAdSlots = (): Promise<void> => {
    // Get all ad slots
    const adSlots: Array<Element> = qwery(dfpEnv.adSlotSelector);

    return fastdom.write(() =>
        adSlots.forEach((adSlot: Element) => adSlot.remove())
    );
};

const setPublisherProvidedId = (): void => {
    const user: ?Object = getUserFromCookie();
    if (user) {
        const hashedId = sha1.hash(user.id);
        window.googletag.pubads().setPublisherProvidedId(hashedId);
    }
};

export const init = (): Promise<void> => {
    const setupAdvertising = (): Promise<void> => {
        // note: fillAdvertSlots isn't synchronous like most buffered cmds, it's a promise. It's put in here to ensure
        // it strictly follows preceding prepare-googletag work (and the module itself ensures dependencies are
        // fulfilled), but don't assume fillAdvertSlots is complete when queueing subsequent work using cmd.push
        window.googletag.cmd.push(
            setDfpListeners,
            setPageTargeting,
            setPublisherProvidedId,
            refreshOnResize,
            () => {
                fillAdvertSlots();
            }
        );

        onIabConsentNotification(state => {
            const consentState =
                state[1] && state[2] && state[3] && state[4] && state[5];

            window.googletag.cmd.push(() => {
                window.googletag
                    .pubads()
                    .setRequestNonPersonalizedAds(consentState ? 0 : 1);
            });
        });

        // Just load googletag. Prebid will already be loaded, and googletag is already added to the window by Prebid.
        return loadScript(config.get('libs.googletag'), { async: false });
    };

    if (commercialFeatures.dfpAdvertising) {
        // A promise error here, from a failed module load,
        // could be a network problem or an intercepted request.
        // Abandon the init sequence.
        setupAdvertising()
            .then(adFreeSlotRemove)
            .catch(removeAdSlots);

        return Promise.resolve();
    }

    return removeAdSlots();
};
