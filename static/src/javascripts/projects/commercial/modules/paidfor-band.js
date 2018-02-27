// @flow

import { Sticky } from 'common/modules/ui/sticky';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';

export const init = (): Promise<boolean> => {
    if (!commercialFeatures.paidforBand) {
        return Promise.resolve(false);
    }

    const elem = document.querySelector('.paidfor-band');
    if (elem) {
        new Sticky(elem).init();
    }

    return Promise.resolve(true);
};
