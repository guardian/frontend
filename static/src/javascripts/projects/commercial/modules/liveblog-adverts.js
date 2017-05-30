// @flow
import fastdom from 'lib/fastdom-promise';
import detect from 'lib/detect';
import mediator from 'lib/mediator';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import createSlot from 'commercial/modules/dfp/create-slot';
import spaceFiller from 'common/modules/article/space-filler';

const INTERVAL = 5; // number of posts between ads
const OFFSET = 1.5; // ratio of the screen height from which ads are loaded
const MAX_ADS = 8; // maximum number of ads to display

type spaceFillerRules = {
    bodySelector: string,
    slotSelector: string,
    fromBottom: boolean,
    startAt: Node | null | typeof undefined, // #? I feel this is circumventing the point of Flow
    absoluteMinAbove: number,
    minAbove: number,
    minBelow: number,
    filter: (slot: { top: number }, index: number) => boolean,
};

let SLOTCOUNTER = 0;
let WINDOWHEIGHT;
let firstSlot;

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
): spaceFillerRules => {
    let prevSlot;
    let prevIndex;
    const shouldUpdate: boolean = !!update;

    const filterSlot = (slot: { top: number }, index: number): boolean => {
        if (index === 0) {
            prevSlot = slot;
            prevIndex = index;
            return !shouldUpdate;
        } else if (
            index - prevIndex >= INTERVAL &&
            Math.abs(slot.top - prevSlot.top) >= windowHeight
        ) {
            prevSlot = slot;
            prevIndex = index;
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

const insertAds = (slots: HTMLCollection<HTMLElement>): void => {
    const isMobile = detect.getBreakpoint() === 'mobile';

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

const fill = (rules: spaceFillerRules): void =>
    spaceFiller.fillSpace(rules, insertAds).then(result => {
        if (result && SLOTCOUNTER < MAX_ADS) {
            const el = document.querySelector(`${rules.bodySelector} > .ad-slot`);
            firstSlot = el ? el.previousSibling : null;
            startListening();
        } else {
            firstSlot = null;
        }
    });

const onUpdate = () => {
    stopListening();
    Promise.resolve(getSpaceFillerRules(WINDOWHEIGHT, true)).then(fill);
};

export const initLiveblogAdverts = (
    start: () => void,
    stop: () => void
): Promise<void> => {
    start();

    if (!commercialFeatures.liveblogAdverts) {
        stop();
        return Promise.resolve();
    }

    fastdom
        .read(() => (WINDOWHEIGHT = getWindowHeight()))
        .then(getSpaceFillerRules)
        .then(fill)
        .then(stop);

    return Promise.resolve();
};

export const _ = { getSlotName };
