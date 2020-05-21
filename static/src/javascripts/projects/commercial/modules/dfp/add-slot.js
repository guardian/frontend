// @flow
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { Advert } from 'commercial/modules/dfp/Advert';
import { queueAdvert } from 'commercial/modules/dfp/queue-advert';

import { loadAdvert } from 'commercial/modules/dfp/load-advert';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';

const displayAd = (adSlot: HTMLElement, forceDisplay: boolean) => {
    const advert: Advert = new Advert(adSlot);

    dfpEnv.advertIds[advert.id] = dfpEnv.adverts.push(advert) - 1;
    if (dfpEnv.shouldLazyLoad() && !forceDisplay) {
        console.log('lazy load ad slot')
        queueAdvert(advert);
        enableLazyLoad(advert);
    } else {
        console.log('load ad slot')
        loadAdvert(advert);
    }
};

const addSlot = (adSlot: HTMLElement, forceDisplay: boolean) => {
    console.log('&&&&&&&&&&&&&&&&&&&&&&&')
    console.log('addSlot')
    console.log('&&&&&&&&&&&&&&&&&&&&&&&')
    console.log('forceDisplay', forceDisplay)
    console.log('adSlot', adSlot)
    console.log('adSlot.id', adSlot.id)
    console.log('dfpEnv.advertIds', dfpEnv.advertIds)
    console.log('adSlot.id in dfpEnv.advertIds', adSlot.id in dfpEnv.advertIds)
    window.googletag.cmd.push(() => {
        if (!(adSlot.id in dfpEnv.advertIds)) {
            // dynamically add ad slot
            displayAd(adSlot, forceDisplay);
        }
    });
    console.log('&&&&&&&&&&&&&&&&&&&&&&&')
};

export { addSlot };
