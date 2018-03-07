// @flow

import { session } from 'lib/storage';
import type { SlotVisibilityChangedEvent } from 'commercial/types';
import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

export const onSlotVisibilityChanged = (
    event: SlotVisibilityChangedEvent
): void => {
    if (session.isAvailable()) {
        const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());

        if (advert && advert.maxViewPercentage < event.inViewPercentage) {
            // Check the inViewPercentage has crossed the 90% threshold.
            if (advert.maxViewPercentage <= 90 && event.inViewPercentage > 90) {
                const highVisibilitySlots =
                    session.get('gu.commercial.slotVisibility') || 0;
                session.set(
                    'gu.commercial.slotVisibility',
                    highVisibilitySlots + 1
                );
            }

            advert.maxViewPercentage = event.inViewPercentage;
        }
    }
};
