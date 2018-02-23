// @flow
import type { ImpressionViewableEvent } from 'commercial/types';

import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';

export const onSlotViewable = (event: ImpressionViewableEvent): void => {
    const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());
    const viewabilityThresholdMs = 30000;

    if (advert && advert.shouldRefresh) {
        const onDocumentVisible = () => {
            if (!document.hidden) {
                document.removeEventListener(
                    'visibilitychange',
                    onDocumentVisible
                );
                enableLazyLoad(advert);
            }
        };

        setTimeout(() => {
            if (document.hidden) {
                document.addEventListener(
                    'visibilitychange',
                    onDocumentVisible
                );
            } else {
                enableLazyLoad(advert);
            }
        }, viewabilityThresholdMs);
    }
};
