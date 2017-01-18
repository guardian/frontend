define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/user-timing',
    'commercial/modules/high-merch',
    'commercial/modules/article-aside-adverts',
    'commercial/modules/article-body-adverts',
    'commercial/modules/close-disabled-slots',
    'commercial/modules/dfp/prepare-googletag',
    'commercial/modules/dfp/prepare-sonobi-tag',
    'commercial/modules/dfp/fill-advert-slots',
    'commercial/modules/hosted/about',
    'commercial/modules/hosted/video',
    'commercial/modules/hosted/gallery',
    'commercial/modules/hosted/onward-journey-carousel',
    'commercial/modules/hosted/onward',
    'commercial/modules/slice-adverts',
    'commercial/modules/liveblog-adverts',
    'commercial/modules/sticky-top-banner',
    'commercial/modules/third-party-tags',
    'commercial/modules/paidfor-band',
    'commercial/modules/paid-containers',
    'commercial/modules/dfp/performance-logging',
    'common/modules/analytics/google',
    'common/modules/commercial/user-features'
], function (
    Promise,
    config,
    mediator,
    robust,
    userTiming,
    highMerch,
    articleAsideAdverts,
    articleBodyAdverts,
    closeDisabledSlots,
    prepareGoogletag,
    prepareSonobiTag,
    fillAdvertSlots,
    hostedAbout,
    hostedVideo,
    hostedGallery,
    hostedOJCarousel,
    hostedOnward,
    sliceAdverts,
    liveblogAdverts,
    stickyTopBanner,
    thirdPartyTags,
    paidforBand,
    paidContainers,
    performanceLogging,
    ga,
    userFeatures
) {
    var primaryModules = [
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-prepare-sonobi-tag', prepareSonobiTag.init],
        ['cm-prepare-googletag', prepareGoogletag.init, prepareGoogletag.customTiming],
        ['cm-highMerch', highMerch.init],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-liveblogAdverts', liveblogAdverts.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ];

    var secondaryModules = [
        ['cm-stickyTopBanner', stickyTopBanner.init],
        ['cm-fill-advert-slots', fillAdvertSlots.init, fillAdvertSlots.customTiming],
        ['cm-paidContainers', paidContainers.init],
        ['cm-paidforBand', paidforBand.init]
    ];

    var customTimingModules = [];

    if (config.page.isHosted) {
        secondaryModules.push(
            ['cm-hostedAbout', hostedAbout.init],
            ['cm-hostedVideo', hostedVideo.init, hostedVideo.customTiming],
            ['cm-hostedGallery', hostedGallery.init, hostedGallery.customTiming],
            ['cm-hostedOnward', hostedOnward.init, hostedOnward.customTiming],
            ['cm-hostedOJCarousel', hostedOJCarousel.init]);
    }

    function loadModules(modules, baseline) {

        performanceLogging.addStartTimeBaseline(baseline);

        var modulePromises = [];

        modules.forEach(function (module) {

            var moduleName = module[0];
            var moduleInit = module[1];
            var hasCustomTiming = module[2];

            robust.catchErrorsAndLog(moduleName, function () {
                if (hasCustomTiming) {
                    // Modules that use custom timing perform their own measurement timings.
                    // These modules all have async init procedures which don't block, and return a promise purely for
                    // perf logging, to time when their async work is done. The command buffer guarantees execution order,
                    // so we don't use the returned promise to order the bootstrap's module invocations.
                    customTimingModules.push(moduleInit(moduleName));
                } else {
                    // Standard modules return a promise that must resolve before dependent bootstrap modules can begin
                    // to execute. Timing is done here in the bootstrap, using the appropriate baseline.
                    var modulePromise = moduleInit(moduleName).then(function () {
                        performanceLogging.moduleCheckpoint(moduleName, baseline);
                    });

                    modulePromises.push(modulePromise);
                }
            });
        });

        return Promise.all(modulePromises)
        .then(function(moduleLoadResult){
            performanceLogging.addEndTimeBaseline(baseline);
            return moduleLoadResult;
        });
    }

    return {
        init: function () {
            if (!config.switches.commercial) {
                return;
            }

            if (config.switches.adFreeMembershipTrial && userFeatures.isAdFreeUser()) {
                closeDisabledSlots.init();
                return;
            }

            userTiming.mark('commercial start');
            robust.catchErrorsAndLog('ga-user-timing-commercial-start', function () {
                ga.trackPerformance('Javascript Load', 'commercialStart', 'Commercial start parse time');
            });

            // Stub the command queue
            window.googletag = { cmd: [] };

            return loadModules(primaryModules, performanceLogging.primaryBaseline)
            .then(function () {
                return loadModules(secondaryModules, performanceLogging.secondaryBaseline);
            })
            .then(function () {
                mediator.emit('page:commercial:ready');
                userTiming.mark('commercial end');
                robust.catchErrorsAndLog('ga-user-timing-commercial-end', function () {
                    ga.trackPerformance('Javascript Load', 'commercialEnd', 'Commercial end parse time');
                });
                if (config.page.isHosted) {
                    // Wait for all custom timing async work to finish before manually reporting the perf data.
                    // There are no MPUs on hosted pages, so no slot render events, and therefore no reporting would be done.
                    Promise.all(customTimingModules).then(performanceLogging.reportTrackingData);
                }
            });
        }
    };

});
