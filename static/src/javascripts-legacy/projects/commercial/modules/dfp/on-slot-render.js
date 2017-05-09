define([
    'Promise',
    'lodash/functions/once',
    'lib/config',
    'lib/mediator',
    'lib/report-error',
    'lib/user-timing',
    'common/modules/analytics/beacon',
    'commercial/modules/dfp/dfp-env',
    'commercial/modules/dfp/Advert',
    'commercial/modules/dfp/render-advert',
    'commercial/modules/dfp/empty-advert',
    'commercial/modules/dfp/get-advert-by-id'
], function (Promise, once, config, mediator, reportError, userTiming, beacon, dfpEnv, Advert, renderAdvert, emptyAdvert, getAdvertById) {
    var recordFirstAdRendered = once(function () {
        beacon.fire('/count/ad-render.gif');
    });

    return onSlotRender;

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
});
