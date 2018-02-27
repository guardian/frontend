// @flow
import type { ImpressionViewableEvent } from 'commercial/types';

import { Advert } from 'commercial/modules/dfp/Advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';
import config from 'lib/config';

const shouldRefresh = (advert: Advert): boolean => {
    const sizeString = advert.size && advert.size.toString();
    const isNotFluid = sizeString !== '0,0';
    const neverHasVideo =
        advert.id !== 'dfp-ad--inline1' ||
        config.get('page.isFront') ||
        config.get('page.contentType') === 'LiveBlog';

    return isNotFluid && neverHasVideo && !config.page.hasPageSkin;
};

export const onSlotViewable = (event: ImpressionViewableEvent): void => {
    const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());
    const viewabilityThresholdMs = 30000;

    if (advert && shouldRefresh(advert)) {
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
