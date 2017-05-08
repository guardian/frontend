// @flow
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import Advert from 'commercial/modules/dfp/Advert';
import queueAdvert from 'commercial/modules/dfp/queue-advert';
import loadAdvert from 'commercial/modules/dfp/load-advert';
import { enableLazyLoad } from 'commercial/modules/dfp/enable-lazy-load';
import performanceLogging from 'commercial/modules/dfp/performance-logging';

const displayAd = (adSlot: HTMLElement, forceDisplay: Boolean) => {
    const advert: Advert = Advert(adSlot);

    dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
    if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
        queueAdvert(advert);
        performanceLogging.updateAdvertMetric(
            advert,
            'loadingMethod',
            'add-slot-lazy'
        );
        enableLazyLoad(advert);
    } else {
        performanceLogging.updateAdvertMetric(
            advert,
            'loadingMethod',
            'add-slot-instant'
        );
        performanceLogging.updateAdvertMetric(advert, 'lazyWaitComplete', 0);
        loadAdvert(advert);
    }
};

const addSlot = (adSlot: HTMLElement, forceDisplay: Boolean) => {
    window.googletag.cmd.push(() => {
        if (!(adSlot.id in dfpEnv.advertIds)) {
            // dynamically add ad slot
            displayAd(adSlot, forceDisplay);
        }
    });
};

export { addSlot };
