// @flow

import { session } from 'lib/storage';
import type { SlotVisibilityChangedEvent } from 'commercial/types';
import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { getAdverts } from 'commercial/modules/dfp/get-adverts';

export const onSlotVisibilityChanged = (event: SlotVisibilityChangedEvent): void => {
    if (session.isAvailable()) {
        const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());

        if (advert && advert.maxViewPercentage < event.inViewPercentage) {
            advert.maxViewPercentage = event.inViewPercentage;
        }

        const adverts = getAdverts();
        const highVisibilitySlots = Object.values(adverts).filter((advert) => advert.maxViewPercentage > 90).length;
        session.set('gu.commercial.slotVisibility', highVisibilitySlots);
    }
};
