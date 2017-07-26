// @flow

import fastdom from 'fastdom';
import { Advert } from 'commercial/modules/dfp/Advert';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';

const removeFromDfpEnv = advert => {
    const removeAdvert = (adverts: Array<Advert>): Array<Advert> =>
        adverts.filter(_ => _ !== advert);

    dfpEnv.adverts = removeAdvert(dfpEnv.adverts);
    dfpEnv.advertsToRefresh = removeAdvert(dfpEnv.advertsToRefresh);
    dfpEnv.advertsToLoad = removeAdvert(dfpEnv.advertsToLoad);
    dfpEnv.advertIds = {};
    dfpEnv.adverts.forEach((ad, i) => {
        dfpEnv.advertIds[ad.id] = i;
    });
};

const emptyAdvert = (advert: Advert): void => {
    fastdom.write(() => {
        window.googletag.destroySlots([advert.slot]);
        advert.node.remove();
        removeFromDfpEnv(advert);
    });
};

export { emptyAdvert };
