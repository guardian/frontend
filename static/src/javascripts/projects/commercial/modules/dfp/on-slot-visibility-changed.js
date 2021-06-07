import { storage } from '@guardian/libs';
import { getAdvertById } from './get-advert-by-id';

export const onSlotVisibilityChanged = (
    event
) => {
    if (storage.session.isAvailable()) {
        const advert = getAdvertById(event.slot.getSlotElementId());

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
