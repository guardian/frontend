// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { spaceFiller } from 'common/modules/article/space-filler';

const rules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 400,
    minBelow: 300,
    clearContentMeta: 0,
    selectors: {
        ' .element-rich-link': {
            minAbove: 200,
            minBelow: 200,
        },
        ' .element-image': {
            minAbove: 50,
            minBelow: 50,
        },
        ' .player': {
            minAbove: 0,
            minBelow: 0,
        },
        ' > h1': {
            minAbove: 0,
            minBelow: 0,
        },
        ' > h2': {
            minAbove: 0,
            minBelow: 0,
        },
        ' > *:not(p):not(h2):not(blockquote)': {
            minAbove: 0,
            minBelow: 0,
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
        .write(() => paras[0].insertAdjacentElement('afterend', slot))
        .then(() => addSlot(slot, true));
};

const carrotTrafficDriverInit = (): Promise<void> => {
    if (commercialFeatures.carrotTrafficDriver) {
        return spaceFiller.fillSpace(rules, insertSlot, {
            waitForImages: false,
            waitForLinks: false,
            waitForInteractives: false,
        });
    }
    return Promise.resolve();
};

export { carrotTrafficDriverInit };
