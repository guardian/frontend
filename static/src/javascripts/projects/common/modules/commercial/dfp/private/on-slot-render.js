define([
    'lodash/functions/once',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/report-error',
    'common/utils/user-timing',
    'common/modules/analytics/beacon',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/private/create-advert',
    'common/modules/commercial/dfp/private/render-advert',
    'common/modules/commercial/dfp/private/empty-advert',
    'common/modules/commercial/dfp/private/get-advert-by-id'
], function (once, config, mediator, reportError, userTiming, beacon, dfpEnv, createAdvert, renderAdvert, emptyAdvert, getAdvertById) {
    var recordFirstAdRendered = once(function () {
        beacon.beaconCounts('ad-render');
    });

    return onSlotRender;

    function onSlotRender(event) {
        dfpEnv.firstAdRendered = true;
        recordFirstAdRendered();

        var advert = getAdvertById(event.slot.getSlotElementId());
        dfpEnv.fn.stopLoadingAdvert(advert, true);
        dfpEnv.fn.startRenderingAdvert(advert);

        if (event.isEmpty) {
            emptyAdvert(advert);
            reportEmptyResponse(advert.id, event);
            emitRenderEvents(false);
        } else {
            dfpEnv.creativeIDs.push(event.creativeId);
            renderAdvert(advert, event)
            .then(emitRenderEvents);
        }

        function emitRenderEvents(isRendered) {
            dfpEnv.fn.stopRenderingAdvert(advert, isRendered);
            mediator.emit('modules:commercial:dfp:rendered', event);
            allAdsRendered();
        }
    }

    function reportEmptyResponse(adSlotId, event) {
        // This empty slot could be caused by a targeting problem,
        // let's report these and diagnose the problem in sentry.
        // Keep the sample rate low, otherwise we'll get rate-limited (report-error will also sample down)
        if (config.switches.reportEmptyDfpResponses && Math.random() < 0.001) {
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

    function allAdsRendered() {
        if (dfpEnv.adverts.every(function (_) { return _.isRendered || _.isEmpty || _.isHidden; })) {
            userTiming.mark('All ads are rendered');
            mediator.emit('modules:commercial:dfp:alladsrendered');
        }
    }
});
