define([
    'Promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/user-timing',
    'common/modules/experiments/ab',
    'commercial/modules/article-aside-adverts',
    'commercial/modules/article-body-adverts',
    'commercial/modules/article-body-adverts-wide',
    'commercial/modules/close-disabled-slots',
    'commercial/modules/dfp/prepare-googletag',
    'commercial/modules/dfp/prepare-sonobi-tag',
    'commercial/modules/dfp/fill-advert-slots',
    'commercial/modules/front-commercial-components',
    'commercial/modules/gallery-adverts',
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
    detect,
    mediator,
    robust,
    userTiming,
    ab,
    articleAsideAdverts,
    articleBodyAdverts,
    articleBodyAdvertsWide,
    closeDisabledSlots,
    prepareGoogletag,
    prepareSonobiTag,
    fillAdvertSlots,
    frontCommercialComponents,
    galleryAdverts,
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
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', isItRainingAds() ? articleBodyAdvertsWide.init : articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-galleryAdverts', galleryAdverts.init],
        ['cm-liveblogAdverts', liveblogAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ];

    var secondaryModules = [
        ['cm-fill-advert-slots', fillAdvertSlots.init],
        ['cm-paidforBand', paidforBand.init],
        ['cm-paidContainers', paidContainers.init],
        ['cm-ready', function () {
            mediator.emit('page:commercial:ready');
            userTiming.mark('commercial end');
            robust.catchErrorsAndLog('ga-user-timing-commercial-end', function () {
                ga.trackPerformance('Javascript Load', 'commercialEnd', 'Commercial end parse time');
            });
            return Promise.resolve();
        }]
    ];

    if (config.page.isHosted) {
        secondaryModules.unshift(
            ['cm-hostedAbout', hostedAbout.init],
            ['cm-hostedVideo', hostedVideo.init],
            ['cm-hostedGallery', hostedGallery.init],
            ['cm-hostedOnward', hostedOnward.init],
            ['cm-hostedOJCarousel', hostedOJCarousel.init]);
    }

    if ((config.switches.disableStickyAdBannerOnMobile && detect.getBreakpoint() === 'mobile') ||
         config.page.disableStickyTopBanner
    ) {
        config.page.hasStickyAdBanner = false;
    } else {
        config.page.hasStickyAdBanner = true;
        secondaryModules.unshift(['cm-stickyTopBanner', stickyTopBanner.init]);
    }

    function loadModules(modules, baseline) {

        performanceLogging.addStartTimeBaseline(baseline);

        var modulePromises = [];

        modules.forEach(function (pair) {

            var moduleName = pair[0];
            var moduleInit = pair[1];
            var hasCustomTiming = pair[2];

            robust.catchErrorsAndLog(moduleName, function () {
                var modulePromise = moduleInit(moduleName).then(function(){
                    if (!hasCustomTiming) {
                        performanceLogging.moduleCheckpoint(moduleName, baseline);
                    }
                });

                modulePromises.push(modulePromise);
            });
        });

       return Promise.all(modulePromises)
           .then(function(moduleLoadResult){
               performanceLogging.addEndTimeBaseline(baseline);
               return moduleLoadResult;
           });
    }

    function isItRainingAds() {
        var testName = 'ItsRainingInlineAds';
        return !config.page.isImmersive && ab.testCanBeRun(testName) && ['geo', 'nogeo'].indexOf(ab.getTestVariantId(testName)) > -1;
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

            loadModules(primaryModules, performanceLogging.primaryBaseline).then(function(){
                loadModules(secondaryModules, performanceLogging.secondaryBaseline);
            });
        }
    };

});
