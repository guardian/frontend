import { dfpEnv } from './dfp-env';
import { Advert } from './Advert';
import { queueAdvert } from './queue-advert';

import { loadAdvert } from './load-advert';
import { enableLazyLoad } from './lazy-load';

const displayAd = (adSlot, forceDisplay) => {
    const advert = new Advert(adSlot);

    dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
    if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
        queueAdvert(advert);
        enableLazyLoad(advert);
    } else {
        loadAdvert(advert);
    }
};

const addSlot = (adSlot, forceDisplay) => {
    window.googletag.cmd.push(() => {
        if (!(adSlot.id in dfpEnv.advertIds)) {
            // dynamically add ad slot
            displayAd(adSlot, forceDisplay);
        }
    });
};

export { addSlot };
