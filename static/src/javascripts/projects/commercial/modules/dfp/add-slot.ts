import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';
import { loadAdvert } from 'commercial/modules/dfp/load-advert';
import { queueAdvert } from 'commercial/modules/dfp/queue-advert';

const displayAd = (adSlot: HTMLElement, forceDisplay: boolean) => {
    const advert: Advert = new Advert(adSlot);

    dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
    if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
        queueAdvert(advert);
        enableLazyLoad(advert);
    } else {
        loadAdvert(advert);
    }
};

const addSlot = (adSlot: HTMLElement, forceDisplay: boolean) => {
    window.googletag.cmd.push(() => {
        if (!(adSlot.id in dfpEnv.advertIds)) {
            // dynamically add ad slot
            displayAd(adSlot, forceDisplay);
        }
    });
};

export { addSlot };
