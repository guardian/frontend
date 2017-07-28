// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';

/*
 The heuristic for adding a carrot slot into an article is as follows:
 1) it must be after the second paragraph and
 2) it must be after the 100th word in the article

 This is to prevent it appearing after single word paragraphs that are encountered
 at the top of some article. It still isn't perfect, but it is good enough for a test.
 */
const findSuitableCarrotPosition = (
    paragraphs: Array<HTMLElement>
): ?HTMLElement => {
    let runningWordCount = 0;
    let index = 0;

    while (index < paragraphs.length) {
        runningWordCount += paragraphs[index].textContent.split(' ').length;

        if (runningWordCount >= 100 && index >= 1) return paragraphs[index];

        index += 1;
    }
};

const carrotSlotInit = () => {
    if (commercialFeatures.carrotSlot) {
        const paragraphs = Array.from(
            document.querySelectorAll('.js-article__body p')
        );
        const anchor: ?HTMLElement = findSuitableCarrotPosition(paragraphs);

        if (anchor) {
            const slot = createSlot('carrot');

            return fastdom
                .write(() => anchor.insertAdjacentElement('beforeend', slot))
                .then(() => addSlot(slot, true));
        }
    }

    return Promise.resolve();
};

export { carrotSlotInit };
