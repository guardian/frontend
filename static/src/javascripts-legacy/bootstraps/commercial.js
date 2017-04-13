define([
    'Promise',
    'lib/config',
    'lib/robust',
    'lib/user-timing',
    'lib/report-error',
    'commercial/modules/high-merch',
    'commercial/modules/article-aside-adverts',
    'commercial/modules/article-body-adverts',
    'commercial/modules/close-disabled-slots',
    'commercial/modules/dfp/prepare-googletag',
    'commercial/modules/dfp/prepare-sonobi-tag',
    'commercial/modules/dfp/prepare-switch-tag',
    'commercial/modules/dfp/fill-advert-slots',
    'commercial/modules/hosted/about',
    'commercial/modules/hosted/video',
    'commercial/modules/hosted/gallery',
    'commercial/modules/hosted/onward-journey-carousel',
    'commercial/modules/hosted/onward',
    'commercial/modules/liveblog-adverts',
    'commercial/modules/sticky-top-banner',
    'commercial/modules/third-party-tags',
    'commercial/modules/paidfor-band',
    'commercial/modules/paid-containers',
    'commercial/modules/dfp/performance-logging',
    'common/modules/analytics/google',
    'commercial/modules/user-features'
], function (
    Promise,
    config,
    robust,
    userTiming,
    reportError,
    highMerch,
    articleAsideAdverts,
    articleBodyAdverts,
    closeDisabledSlots,
    prepareGoogletag,
    prepareSonobiTag,
    prepareSwitchTag,
    fillAdvertSlots,
    hostedAbout,
    hostedVideo,
    hostedGallery,
    hostedOJCarousel,
    hostedOnward,
    liveblogAdverts,
    stickyTopBanner,
    thirdPartyTags,
    paidforBand,
    paidContainers,
    performanceLogging,
    ga,
    userFeatures
) {
    var commercialModules = [
        ['cm-highMerch', highMerch.init],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-prepare-sonobi-tag', prepareSonobiTag.init, true],
        ['cm-prepare-switch-tag', prepareSwitchTag.init, true],
        ['cm-articleAsideAdverts', articleAsideAdverts.init, true],
        ['cm-prepare-googletag', prepareGoogletag.init, true],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-liveblogAdverts', liveblogAdverts.init, true],
        ['cm-closeDisabledSlots', closeDisabledSlots.init],
        ['cm-stickyTopBanner', stickyTopBanner.init],
        ['cm-fill-advert-slots', fillAdvertSlots.init, true],
        ['cm-paidContainers', paidContainers.init],
        ['cm-paidforBand', paidforBand.init]
    ];

    if (config.page.isHosted) {
        commercialModules.push(
            ['cm-hostedAbout', hostedAbout.init],
            ['cm-hostedVideo', hostedVideo.init, true],
            ['cm-hostedGallery', hostedGallery.init],
            ['cm-hostedOnward', hostedOnward.init, true],
            ['cm-hostedOJCarousel', hostedOJCarousel.init]
        );
    }

    function loadModules(modules, baseline) {

        performanceLogging.addStartTimeBaseline(baseline);

        var modulePromises = [];

        modules.forEach(function (module) {
            var moduleName = module[0];
            var moduleInit = module[1];
            var moduleDefer = module[2];

            robust.catchErrorsWithContext([
                [moduleName, function () {
                    // These modules all have async init procedures which don't block, and return a promise purely for
                    // perf logging, to time when their async work is done. The command buffer guarantees execution order,
                    // so we don't use the returned promise to order the bootstrap's module invocations.
                    var wrapped = moduleDefer ?
                        performanceLogging.defer(moduleName, moduleInit) :
                        performanceLogging.wrap(moduleName, moduleInit);
                    var result = wrapped();
                    modulePromises.push(result);
                }]
            ]);
        });

        return Promise.all(modulePromises)
        .then(function(){
            performanceLogging.addEndTimeBaseline(baseline);
        });
    }

    return function () {
        if (config.switches.adFreeMembershipTrial && userFeatures.isAdFreeUser()) {
            closeDisabledSlots.init(true);
            return Promise.resolve();
        }

        userTiming.markTime('commercial start');
        robust.catchErrorsWithContext([
            ['ga-user-timing-commercial-start', function () {
                ga.trackPerformance('Javascript Load', 'commercialStart', 'Commercial start parse time');
            }],
        ]);

        // Stub the command queue
        window.googletag = { cmd: [] };

        return loadModules(commercialModules, performanceLogging.primaryBaseline)
        .then(function () {
            userTiming.markTime('commercial end');
            robust.catchErrorsWithContext([
                ['ga-user-timing-commercial-end', function () {
                    ga.trackPerformance('Javascript Load', 'commercialEnd', 'Commercial end parse time');
                }]
            ]);
        })
        .catch(function (err) {
            // Just in case something goes wrong, we don't want it to
            // prevent enhanced from loading
            reportError(err, {
                feature: 'commercial'
            });
        });
    }

});
