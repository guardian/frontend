import { getUrlVars } from 'lib/url';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import { enableLazyLoad } from 'commercial/modules/dfp/lazy-load';

const setSlotAdRefresh = (event) => {
    const advert = getAdvertById(event.slot.getSlotElementId());
    const viewabilityThresholdMs = 30000; // 30 seconds refresh

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
            // During the elapsed time, a 'disable-refresh' message may have been posted.
            // Check the flag again.
            if (!advert.shouldRefresh) {
                return;
            }
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

/*

  Returns a function to be used as a callback for GTP 'impressionViewable' event

  Uses URL parameters.

 */
export const onSlotViewableFunction = () => {
    const queryParams = getUrlVars();

    if (queryParams.adrefresh !== 'false') {
        return setSlotAdRefresh;
    }

    // Nothing to do. Return an empty callback
    return () => {};
};
