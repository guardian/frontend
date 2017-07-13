// @flow

import { Sticky } from 'common/modules/ui/sticky';
import { commercialFeatures } from 'commercial/modules/commercial-features';

const initPaidForBand = (): Promise<boolean> => {
    if (!commercialFeatures.paidforBand) {
        return Promise.resolve(false);
    }

    const elem = document.querySelector('.paidfor-band');
    if (elem) {
        new Sticky(elem).init();
    }

    return Promise.resolve(true);
};

export { initPaidForBand };
