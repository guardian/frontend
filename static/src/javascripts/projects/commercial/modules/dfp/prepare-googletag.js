// @flow

import raven from 'lib/raven';
import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { buildPageTargeting } from 'commercial/modules/build-page-targeting';
import { adSlotSelector } from 'commercial/modules/close-disabled-slots';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import onSlotRender from 'commercial/modules/dfp/on-slot-render';
import onSlotLoad from 'commercial/modules/dfp/on-slot-load';
import {
    addTag,
    setListeners,
} from 'commercial/modules/dfp/performance-logging';
import 'commercial/modules/messenger/type';
import 'commercial/modules/messenger/get-stylesheet';
import 'commercial/modules/messenger/resize';
import 'commercial/modules/messenger/scroll';
import 'commercial/modules/messenger/viewport';
import 'commercial/modules/messenger/click';
import 'commercial/modules/messenger/background';

const setDfpListeners = (): void => {
    setListeners(window.googletag);

    const pubads = window.googletag.pubads();
    pubads.addEventListener('slotRenderEnded', raven.wrap(onSlotRender));
    pubads.addEventListener('slotOnload', raven.wrap(onSlotLoad));
};

const setPageTargeting = (): void => {
    const pubads = window.googletag.pubads();
    const targeting = buildPageTargeting();
    Object.keys(targeting).forEach(key => {
        pubads.setTargeting(key, targeting[key]);
    });
};

const removeAdSlots = (): Promise<void> => {
    // Get all ad slots
    let adSlots: Array<Element> = qwery(adSlotSelector);

    return fastdom.write(() =>
        adSlots.forEach((adSlot: Element) => adSlot.remove())
    );
};

const init = (start: () => void, stop: () => void): Promise<void> => {
    const setupAdvertising = (): Promise<void> => {
        addTag(dfpEnv.sonobiEnabled ? 'sonobi' : 'waterfall');

        window.googletag.cmd.push(
            start,
            setDfpListeners,
            setPageTargeting,
            stop
        );

        // Just load googletag. Sonobi's wrapper will already be loaded, and googletag is already added to the window by sonobi.
        return loadScript(config.libs.googletag, { async: false });
    };

    if (commercialFeatures.dfpAdvertising) {
        setupAdvertising()
            // A promise error here, from a failed module load,
            // could be a network problem or an intercepted request.
            // Abandon the init sequence.
            .catch(removeAdSlots);
        return Promise.resolve();
    }

    return removeAdSlots();
};

export default {
    init,
};
