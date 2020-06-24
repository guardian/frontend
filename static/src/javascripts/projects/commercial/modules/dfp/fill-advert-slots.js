// @flow

import qwery from 'qwery';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { Advert } from 'commercial/modules/dfp/Advert';
import { queueAdvert } from 'commercial/modules/dfp/queue-advert';
import { displayLazyAds } from 'commercial/modules/dfp/display-lazy-ads';
import { displayAds } from 'commercial/modules/dfp/display-ads';
import { setupPrebidOnce } from 'commercial/modules/dfp/prepare-prebid';
import { closeDisabledSlots } from 'commercial/modules/close-disabled-slots';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

import { getBreakpoint } from 'lib/detect';
import config from 'lib/config';

// Pre-rendered ad slots that were rendered on the page by the server are collected here.
// For dynamic ad slots that are created at js-runtime, see:
//  article-aside-adverts
//  article-body-adverts
//  liveblog-adverts
//  high-merch
const fillAdvertSlots = (): Promise<void> => {
    // This module has the following strict dependencies. These dependencies must be
    // fulfilled before fillAdvertSlots can execute reliably. The bootstrap (commercial.js)
    // initiates these dependencies, to speed up the init process. Bootstrap also captures the module performance.
    const dependencies: Promise<void>[] = [
        setupPrebidOnce(),
        closeDisabledSlots(),
    ];

    return Promise.all(dependencies).then(() => {
        // Quit if ad-free
        if (commercialFeatures.adFree) {
            return Promise.resolve();
        }
        const isDCRMobile =
            config.get('isDotcomRendering', false) &&
            getBreakpoint() === 'mobile'
        // Get all ad slots
        const adverts = qwery(dfpEnv.adSlotSelector)
            .filter(adSlot => !(adSlot.id in dfpEnv.advertIds))
            // TODO: find cleaner workaround
            // we need to not init top-above-nav on mobile view in DCR
            // as the DOM element needs to be removed and replaced to be inline
            // refer to: 3562dc07-78e9-4507-b922-78b979d4c5cb
            .filter(adSlot => !(isDCRMobile && adSlot.id === 'dfp-ad--top-above-nav'))
            .map(adSlot => new Advert(adSlot));
        const currentLength = dfpEnv.adverts.length;
        dfpEnv.adverts = dfpEnv.adverts.concat(adverts);
        adverts.forEach((advert, index) => {
            dfpEnv.advertIds[advert.id] = currentLength + index;
        });
        adverts.forEach(queueAdvert);

        if (dfpEnv.shouldLazyLoad()) {
            displayLazyAds();
        } else {
            displayAds();
        }
    });
};

export { fillAdvertSlots };
