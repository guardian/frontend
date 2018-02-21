// @flow
import type {
    SpacefinderRules,
    SpacefinderItem,
} from 'common/modules/spacefinder';

import fastdom from 'lib/fastdom-promise';
import { getBreakpoint } from 'lib/detect';
import mediator from 'lib/mediator';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { createSlot } from 'commercial/modules/dfp/create-slot';
import { spaceFiller } from 'common/modules/article/space-filler';

const OFFSET = 1.5; // ratio of the screen height from which ads are loaded
const MAX_ADS = 8; // maximum number of ads to display

let SLOTCOUNTER = 0;
let WINDOWHEIGHT;
let firstSlot: ?HTMLElement;

const startListening = () => {
    // eslint-disable-next-line no-use-before-define
    mediator.on('modules:autoupdate:updates', onUpdate);
};

const stopListening = () => {
    // eslint-disable-next-line no-use-before-define
    mediator.off('modules:autoupdate:updates', onUpdate);
};

const getWindowHeight = (doc = document): number => {
    if (doc.documentElement && doc.documentElement.clientHeight) {
        return doc.documentElement.clientHeight;
    }
    return 0; // #? zero, or throw an error?
};

const getSpaceFillerRules = (
    windowHeight: number,
    update?: boolean
): SpacefinderRules => {
    let prevSlot;
    const shouldUpdate: boolean = !!update;

    const filterSlot = (slot: SpacefinderItem): boolean => {
        if (!prevSlot) {
            prevSlot = slot;
            return !shouldUpdate;
        } else if (Math.abs(slot.top - prevSlot.top) >= windowHeight) {
            prevSlot = slot;
            return true;
        }
        return false;
    };

    return {
        bodySelector: '.js-liveblog-body',
        slotSelector: ' > .block',
        fromBottom: shouldUpdate,
        startAt: shouldUpdate ? firstSlot : null,
        absoluteMinAbove: shouldUpdate ? 0 : WINDOWHEIGHT * OFFSET,
        minAbove: 0,
        minBelow: 0,
        clearContentMeta: 0,
        selectors: {},
        filter: filterSlot,
    };
};

const getSlotName = (isMobile: boolean, slotCounter: number): string => {
    if (isMobile && slotCounter === 0) {
        return 'top-above-nav';
    } else if (isMobile) {
        return `inline${slotCounter}`;
    }
    return `inline${slotCounter + 1}`;
};

const insertAds = (slots: HTMLElement[]): void => {
    const isMobile = getBreakpoint() === 'mobile';

    for (let i = 0; i < slots.length && SLOTCOUNTER < MAX_ADS; i += 1) {
        const slotName = getSlotName(isMobile, SLOTCOUNTER);

        const adSlot = createSlot('inline', {
            name: slotName,
            classes: 'liveblog-inline',
        });
        if (slots[i] && slots[i].parentNode) {
            slots[i].parentNode.insertBefore(adSlot, slots[i].nextSibling);
            addSlot(adSlot, false);
            SLOTCOUNTER += 1;
        }
    }
};

const fill = (rules: SpacefinderRules): Promise<void> =>
    spaceFiller.fillSpace(rules, insertAds).then(result => {
        if (result && SLOTCOUNTER < MAX_ADS) {
            const el = document.querySelector(
                `${rules.bodySelector} > .ad-slot`
            );
            if (el && el.previousSibling instanceof HTMLElement) {
                firstSlot = el.previousSibling;
            } else {
                firstSlot = null;
            }
            startListening();
        } else {
            firstSlot = null;
        }
    });

const onUpdate = () => {
    stopListening();
    Promise.resolve(getSpaceFillerRules(WINDOWHEIGHT, true)).then(fill);
};

export const init = (start: () => void, stop: () => void): Promise<void> => {
    start();

    if (!commercialFeatures.liveblogAdverts) {
        stop();
        return Promise.resolve();
    }

    fastdom
        .read(() => {
            WINDOWHEIGHT = getWindowHeight();
            return WINDOWHEIGHT;
        })
        .then(getSpaceFillerRules)
        .then(fill)
        .then(stop);

    return Promise.resolve();
};

export const _ = { getSlotName };
