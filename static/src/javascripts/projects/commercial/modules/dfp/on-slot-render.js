import once from 'lodash/functions/once';
import config from 'lib/config';
import mediator from 'lib/mediator';
import reportError from 'lib/report-error';
import userTiming from 'lib/user-timing';
import beacon from 'common/modules/analytics/beacon';
import dfpEnv from 'commercial/modules/dfp/dfp-env';
import Advert from 'commercial/modules/dfp/Advert';
import renderAdvert from 'commercial/modules/dfp/render-advert';
import emptyAdvert from 'commercial/modules/dfp/empty-advert';
import getAdvertById from 'commercial/modules/dfp/get-advert-by-id';
var recordFirstAdRendered = once(function() {
    beacon.fire('/count/ad-render.gif');
});

export default onSlotRender;

function onSlotRender(event) {
    recordFirstAdRendered();

    var advert = getAdvertById.getAdvertById(event.slot.getSlotElementId());
    Advert.stopLoading(advert, true);
    Advert.startRendering(advert);
    advert.isEmpty = event.isEmpty;

    if (event.isEmpty) {
        emptyAdvert.emptyAdvert(advert);
        reportEmptyResponse(advert.id, event);
        emitRenderEvents(false);
    } else {
        advert.size = event.size;
        dfpEnv.creativeIDs.push(event.creativeId);
        renderAdvert(advert, event)
            .then(emitRenderEvents);
    }

    function emitRenderEvents(isRendered) {
        Advert.stopRendering(advert, isRendered);
        mediator.emit('modules:commercial:dfp:rendered', event);
    }
}

function reportEmptyResponse(adSlotId, event) {
    // This empty slot could be caused by a targeting problem,
    // let's report these and diagnose the problem in sentry.
    // Keep the sample rate low, otherwise we'll get rate-limited (report-error will also sample down)
    if (Math.random() < 0.0001) {
        var adUnitPath = event.slot.getAdUnitPath();
        var adTargetingMap = event.slot.getTargetingMap();
        var adTargetingKValues = adTargetingMap ? adTargetingMap['k'] : [];
        var adKeywords = adTargetingKValues ? adTargetingKValues.join(', ') : '';

        reportError(new Error('dfp returned an empty ad response'), {
            feature: 'commercial',
            adUnit: adUnitPath,
            adSlot: adSlotId,
            adKeywords: adKeywords
        }, false);
    }
}
