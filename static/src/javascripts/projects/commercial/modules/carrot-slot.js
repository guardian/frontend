// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';

const carrotSlotInit = () => {
    if (commercialFeatures.carrotSlot) {
        const secondArticleParagraph = '.js-article__body p:nth-of-type(2)';
        const anchor = document.querySelector(secondArticleParagraph);

        const slot = createSlot('carrot');

        return fastdom
            .write(() => {
                if (anchor) {
                    anchor.insertAdjacentElement('beforeend', slot);
                }
            })
            .then(() => {
                addSlot(slot, true);
            });
    }

    return Promise.resolve();
};

export { carrotSlotInit };
