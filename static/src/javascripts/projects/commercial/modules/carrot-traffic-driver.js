// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { spaceFiller } from 'common/modules/article/space-filler';
import { getBreakpoint } from 'lib/detect';
import type { SpacefinderRules } from 'common/modules/spacefinder';

const defaultRules: SpacefinderRules = {
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
        ' .element-pullquote': {
            minAbove: 400,
            minBelow: 400,
        },
    },
    fromBottom: true,
};

// desktop(980) and tablet(740)
const desktopRules: SpacefinderRules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 500,
    minBelow: 400,
    clearContentMeta: 0,
    selectors: {
        ' .element-rich-link': {
            minAbove: 400,
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
            minAbove: 400,
            minBelow: 400,
        },
        ' .ad-slot--im': {
            minAbove: 400,
            minBelow: 400,
        },
        ' .element-pullquote': {
            minAbove: 400,
            minBelow: 400,
        },
    },
    fromBottom: true,
};

// mobile(320) and above
const mobileRules: SpacefinderRules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 500,
    minBelow: 400,
    clearContentMeta: 0,
    selectors: {
        ' .element-rich-link': {
            minAbove: 400,
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
            minAbove: 400,
            minBelow: 400,
        },
        ' .ad-slot--im': {
            minAbove: 400,
            minBelow: 400,
        },
        ' .element-pullquote': {
            minAbove: 400,
            minBelow: 400,
        },
    },
    fromBottom: true,
};

const insertSlot = (paras: HTMLElement[]): Promise<void> => {
    const slots = createSlots('carrot');
    const candidates = paras.slice(1);
    return fastdom
        .write(() => {
            slots.forEach(slot => {
                if (candidates[0] && candidates[0].parentNode) {
                    candidates[0].parentNode.insertBefore(slot, candidates[0]);
                }
            });
        })
        .then(() => addSlot(slots[0], true));
};

const getRules = (): SpacefinderRules => {
    switch (getBreakpoint()) {
        case 'mobile':
        case 'mobileMedium':
        case 'mobileLandscape':
        case 'phablet':
            return mobileRules;
        case 'tablet':
        case 'desktop':
            return desktopRules;
        default:
            return defaultRules;
    }
};

export const initCarrot = (): Promise<void> => {
    if (commercialFeatures.carrotTrafficDriver) {
        return spaceFiller.fillSpace(getRules(), insertSlot, {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
        });
    }
    return Promise.resolve();
};
