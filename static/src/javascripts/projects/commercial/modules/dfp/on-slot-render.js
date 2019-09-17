// @flow
import type { SlotRenderEndedEvent } from 'commercial/types';

import once from 'lodash/once';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import { fire } from 'common/modules/analytics/beacon';
import { dfpEnv } from 'commercial/modules/dfp/dfp-env';
import { Advert } from 'commercial/modules/dfp/Advert';
import { renderAdvert } from 'commercial/modules/dfp/render-advert';
import { emptyAdvert } from 'commercial/modules/dfp/empty-advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';
import config from 'lib/config';
import { adSizes } from 'commercial/modules/ad-sizes';
import { markTime } from 'lib/user-timing';

const recordFirstAdRendered = once(() => {
    markTime('Commercial: First Ad Rendered');
    fire('/count/ad-render.gif');
});

const reportEmptyResponse = (
    adSlotId: string,
    event: SlotRenderEndedEvent
): void => {
    // This empty slot could be caused by a targeting problem,
    // let's report these and diagnose the problem in sentry.
    // Keep the sample rate low, otherwise we'll get rate-limited (report-error will also sample down)
    if (Math.random() < 0.0001) {
        const adUnitPath = event.slot.getAdUnitPath();
        const adTargetingKeys = event.slot.getTargetingKeys();
        const adTargetingKValues = adTargetingKeys.includes('k')
            ? event.slot.getTargeting('k')
            : [];
        const adKeywords = adTargetingKValues
            ? adTargetingKValues.join(', ')
            : '';

        reportError(
            new Error('dfp returned an empty ad response'),
            {
                feature: 'commercial',
                adUnit: adUnitPath,
                adSlot: adSlotId,
                adKeywords,
            },
            false
        );
    }
};

const outstreamSizes = [
    adSizes.outstreamDesktop.toString(),
    adSizes.outstreamMobile.toString(),
];

export const onSlotRender = (event: SlotRenderEndedEvent): void => {
    recordFirstAdRendered();

    const advert: ?Advert = getAdvertById(event.slot.getSlotElementId());
    if (!advert) {
        return;
    }

    const emitRenderEvents = (isRendered: boolean) => {
        advert.stopRendering(isRendered);
        mediator.emit('modules:commercial:dfp:rendered', event);
    };

    advert.stopLoading(true);
    advert.startRendering();
    advert.isEmpty = event.isEmpty;

    if (event.isEmpty) {
        emptyAdvert(advert);
        reportEmptyResponse(advert.id, event);
        emitRenderEvents(false);
    } else {
        /**
         * if advert.hasPrebidSize is false we use size
         * from the GAM event when adjusting the slot size.
         * */
        if (!advert.hasPrebidSize) {
            advert.size = event.size;
        }

        if (event.creativeId !== undefined) {
            dfpEnv.creativeIDs.push(event.creativeId);
        }
        // Set refresh field based on the outcome of the slot render.
        const sizeString = advert.size && advert.size.toString();
        const isNotFluid = sizeString !== '0,0';
        const isOutstream = outstreamSizes.includes(sizeString);
        const isNonRefreshableLineItem =
            event.lineItemId &&
            config
                .get('page.dfpNonRefreshableLineItemIds', [])
                .includes(event.lineItemId);

        advert.shouldRefresh =
            isNotFluid &&
            !isOutstream &&
            !config.get('page.hasPageSkin') &&
            !isNonRefreshableLineItem;

        renderAdvert(advert, event).then(emitRenderEvents);
    }
};
