// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { spaceFiller } from 'common/modules/article/space-filler';

const rules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 500,
    minBelow: 400,
    clearContentMeta: 0,
    selectors: {
        ' .element-rich-link': {
            minAbove: 100,
            minBelow: 400,
        },
        ' .element-image': {
            minAbove: 440,
            minBelow: 440,
        },

        ' .player': {
            minAbove: 50,
            minBelow: 50,
        },
        ' > h1': {
            minAbove: 50,
            minBelow: 50,
        },
        ' > h2': {
            minAbove: 50,
            minBelow: 50,
        },
        ' > *:not(p):not(h2):not(blockquote)': {
            minAbove: 50,
            minBelow: 50,
        },
        ' .ad-slot': {
            minAbove: 100,
            minBelow: 100,
        },
    },
    fromBottom: true,
};

const insertSlot = (paras: Element[]): Promise<void> => {
    const slot = createSlot('carrot');
    return fastdom
        .write(() => paras[0].insertAdjacentElement('beforebegin', slot))
        .then(() => addSlot(slot, true));
};

const carrotTrafficDriverInit = (): Promise<void> => {
    if (commercialFeatures.carrotTrafficDriver) {
        return spaceFiller.fillSpace(rules, insertSlot, {
            waitForImages: false,
            waitForLinks: true,
            waitForAds: false,
            waitForInteractives: false,
        });
    }
    return Promise.resolve();
};

export { carrotTrafficDriverInit };
