// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { spaceFiller } from 'common/modules/article/space-filler';
import { isBreakpoint } from 'lib/detect';

const defaultRules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 500,
    minBelow: 400,
    clearContentMeta: 0,
    selectors: {
        ' .element-rich-link': {
            minAbove: 200,
            minBelow: 300,
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
        ' .ad-slot--im': {
            minAbove: 400,
            minBelow: 400,
        },
    },
    fromBottom: true,
};

const mobileRules = {
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

const insertSlot = (paras: HTMLElement[]): Promise<void> => {
    const slots = createSlots('carrot');
    return fastdom
        .write(() => {
            slots.forEach(slot => {
                if (paras[0] && paras[0].parentNode) {
                    paras[0].parentNode.insertBefore(slot, paras[0]);
                }
            });
        })
        .then(() => addSlot(slots[0], true));
};

export const initCarrot = (): Promise<void> => {
    if (commercialFeatures.carrotTrafficDriver) {
        const rules = isBreakpoint({ max: 'tablet' })
            ? mobileRules
            : defaultRules;
        return spaceFiller.fillSpace(rules, insertSlot, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
        });
    }
    return Promise.resolve();
};
