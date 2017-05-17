// @flow
import once from 'lodash/functions/once';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import beacon from 'common/modules/analytics/beacon';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import Advert from 'commercial/modules/dfp/Advert';
import renderAdvert from 'commercial/modules/dfp/render-advert';
import { emptyAdvert } from 'commercial/modules/dfp/empty-advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

type SlotRenderEndedEvent = {
    advertiserId?: number,
    campaignId?: number,
    creativeId?: number,
    isEmpty: boolean,
    lineItemId?: number,
    serviceName: string,
    size: string | number[],
    slot: Object,
    sourceAgnosticCreativeId?: number,
    sourceAgnosticLineItemId?: number,
};

const recordFirstAdRendered = once(() => {
    beacon.fire('/count/ad-render.gif');
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
        const adTargetingMap = event.slot.getTargetingMap();
        const adTargetingKValues = adTargetingMap ? adTargetingMap.k : [];
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

const onSlotRender = (event: SlotRenderEndedEvent): void => {
    recordFirstAdRendered();

    const advert = getAdvertById(event.slot.getSlotElementId());
    if (!advert) {
        return;
    }

    const emitRenderEvents = (isRendered: boolean) => {
        Advert.stopRendering(advert, isRendered);
        mediator.emit('modules:commercial:dfp:rendered', event);
    };

    Advert.stopLoading(advert, true);
    Advert.startRendering(advert);
    advert.isEmpty = event.isEmpty;

    if (event.isEmpty) {
        emptyAdvert(advert);
        reportEmptyResponse(advert.id, event);
        emitRenderEvents(false);
    } else {
        advert.size = event.size;
        if (event.creativeId !== undefined) {
            dfpEnv.creativeIDs.push(event.creativeId);
        }
        renderAdvert(advert, event).then(emitRenderEvents);
    }
};

export default onSlotRender;
