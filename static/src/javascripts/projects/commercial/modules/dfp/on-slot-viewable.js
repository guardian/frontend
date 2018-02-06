// @flow
import type { ImpressionViewableEvent } from 'commercial/types';

import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { refreshAdvert } from 'commercial/modules/dfp/load-advert';

const viweabilityThresholdMs = 30000;

export const onSlotViewable = (event: ImpressionViewableEvent): void => {
    const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());
    if (advert) {
        setTimeout(() => {
            refreshAdvert(advert);
        }, viweabilityThresholdMs);
    }
};
