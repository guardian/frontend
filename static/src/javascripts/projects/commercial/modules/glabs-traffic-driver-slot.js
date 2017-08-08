// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';
import { spaceFiller } from 'common/modules/article/space-filler';

/*
 The heuristic for adding a glabs traffic driver slot into an article is as follows:
 1) it must be after the second paragraph and
 2) it must be after the 100th word in the article

 This is to prevent it appearing after single word paragraphs that are encountered
 at the top of some article. It still isn't perfect, but it is good enough for a test.
 */

let runningWordCount = 0;

const wordCount = (element: Element): number =>
    element.textContent.split(' ').length;

const rules = {
    bodySelector: '.js-article__body',
    slotSelector: ' > p',
    minAbove: 0,
    minBelow: 0,
    clearContentMeta: 0,
    selectors: null,
    filter: (slot: Object, index: number) => {
        runningWordCount += wordCount(slot.element);
        return index >= 2 && runningWordCount >= 100;
    },
};

const insertInlineSlot = (paras: Element[]): Promise<any> => {
    const slot = createSlot('glabs-inline');
    return fastdom
        .write(() => paras[0].insertAdjacentElement('afterend', slot))
        .then(() => addSlot(slot, true));
};

const insertLeftSlot = (paras: Element[]): Promise<any> => {
    const slot = createSlot('glabs-left');
    return fastdom
        .write(() => paras[0].insertAdjacentElement('afterend', slot))
        .then(() => addSlot(slot, true));
};

const glabsTrafficDriverSlotInit = () => {
    if (commercialFeatures.glabsTrafficDriverInlineSlot) {
        return spaceFiller.fillSpace(rules, insertInlineSlot, {
            waitForImages: false,
            waitForLinks: false,
            waitForInteractives: false,
        });
    } else if (commercialFeatures.glabsTrafficDriverLeftSlot) {
        return spaceFiller.fillSpace(rules, insertLeftSlot, {
            waitForImages: false,
            waitForLinks: false,
            waitForInteractives: false,
        });
    }

    return Promise.resolve();
};

export { glabsTrafficDriverSlotInit };
