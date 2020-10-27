// @flow

import { storage } from '@guardian/libs';
import type { SlotVisibilityChangedEvent } from 'commercial/types';
import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

export const onSlotVisibilityChanged = (
    event: SlotVisibilityChangedEvent
): void => {
    if (storage.session.isAvailable()) {
        const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());

        if (advert && advert.maxViewPercentage < event.inViewPercentage) {
            // Check the inViewPercentage has crossed the 90% threshold.
            if (advert.maxViewPercentage <= 90 && event.inViewPercentage > 90) {
                const highVisibilitySlots =
                storage.session.get('gu.commercial.slotVisibility') || 0;
                storage.session.set(
                    'gu.commercial.slotVisibility',
                    highVisibilitySlots + 1
                );
            }

            advert.maxViewPercentage = event.inViewPercentage;
        }
    }
};
