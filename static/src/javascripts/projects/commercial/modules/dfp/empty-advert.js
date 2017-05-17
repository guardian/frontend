// @flow

/* eslint no-multi-assign: "off"*/

import fastdom from 'fastdom';

const emptyAdvert = (advert: Object): void => {
    fastdom.write(() => {
        window.googletag.destroySlots([advert.slot]);
        advert.node.remove();
        advert.node = advert.slot = null;
    });
};

export { emptyAdvert };
