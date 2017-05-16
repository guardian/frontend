// @flow

/* eslint no-multi-assign: "off"*/

import fastdom from 'fastdom';
import Advert from 'commercial/modules/dfp/Advert';

const emptyAdvert = (advert: Advert): void => {
    fastdom.write(() => {
        window.googletag.destroySlots([advert.slot]);
        advert.node.remove();
        // advert.node = advert.slot = null;
    });
};

export { emptyAdvert };
