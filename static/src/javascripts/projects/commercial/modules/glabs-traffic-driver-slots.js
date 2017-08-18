// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { spaceFiller } from 'common/modules/article/space-filler';

/*
 The heuristic for adding a glabs traffic driver slot into an article is as follows:

 1) it must be before the penultimate paragraph and
 2) it must be more than 100 words from the bottom of the article

 This is a rough heuristic for ensuring that the slot isn't added to above
 two very small paragraphs, which would look jarring.
 */

let runningWordCount = 0;

const wordCount = (element: Element): number =>
    element.textContent.split(' ').length;

const rules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 500,
    minBelow: 0,
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
    filter: (slot: Object, index: number): boolean => {
        runningWordCount += wordCount(slot.element);
        return index >= 2 && runningWordCount >= 200;
    },
    fromBottom: true,
};

const insertInlineSlot = (paras: Element[]): Promise<void> => {
    const slot = createSlot('glabs-inline');
    return fastdom
        .write(() => paras[0].insertAdjacentElement('afterend', slot))
        .then(() => addSlot(slot, true));
};

const insertLeftSlot = (paras: Element[]): Promise<void> => {
    const slot = createSlot('glabs-left');
    return fastdom
        .write(() => paras[0].insertAdjacentElement('afterend', slot))
        .then(() => addSlot(slot, true));
};

const glabsTrafficDriverSlotsInit = (): Promise<void> => {
    let insertSlot;

    if (commercialFeatures.glabsTrafficDriverInlineSlot) {
        insertSlot = insertInlineSlot;
    } else if (commercialFeatures.glabsTrafficDriverLeftSlot) {
        insertSlot = insertLeftSlot;
    }

    if (!insertSlot) {
        return Promise.resolve();
    }

    return spaceFiller.fillSpace(rules, insertSlot, {
        waitForImages: false,
        waitForLinks: false,
        waitForInteractives: false,
    });
};

export { glabsTrafficDriverSlotsInit };
