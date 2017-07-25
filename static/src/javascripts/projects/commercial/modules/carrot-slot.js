// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import createSlot from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'commercial/modules/commercial-features';

const carrotSlotInit = () => {
    if (commercialFeatures.carrotSlot) {
        const anchorSelector = '.js-carrot';
        const anchor = document.querySelector(anchorSelector);

        const slot = createSlot('carrot');

        return fastdom
            .write(() => {
                if (anchor) {
                    anchor.insertAdjacentElement('beforebegin', slot);
                }
            })
            .then(() => {
                addSlot(slot, true);
            });
    }

    return Promise.resolve();
};

export { carrotSlotInit };
