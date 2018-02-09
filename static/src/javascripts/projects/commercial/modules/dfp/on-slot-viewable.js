// @flow
import type { ImpressionViewableEvent } from 'commercial/types';

import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';

const getViewabilityThreshold = (advert: Advert): ?number => {
    const refreshThresholdMsDefault = 30000;
    const refreshThresholdMsVideo = 90000;

    const fluidSize = '0,0';

    const sizeString = advert.size && advert.size.toString();
    const videoSizes = ['620,1', '620,350'];

    if (sizeString === fluidSize) {
        return;
    } else if (videoSizes.includes(sizeString)) {
        return refreshThresholdMsVideo;
    }

    return refreshThresholdMsDefault;
};

export const onSlotViewable = (event: ImpressionViewableEvent): void => {
    const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());
    const viewabilityThresholdMs = advert && getViewabilityThreshold(advert);

    if (advert && viewabilityThresholdMs) {
        const onDocumentVisible = () => {
            if (!document.hidden) {
                document.removeEventListener(
                    'visibilitychange',
                    onDocumentVisible
                );
                enableLazyLoad(advert);
            }
        };

        if (viewabilityThresholdMs === -1) {
            return;
        }

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
