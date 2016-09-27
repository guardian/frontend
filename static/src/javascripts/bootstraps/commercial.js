define([
    'Promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/user-timing',
    'commercial/modules/article-aside-adverts',
    'commercial/modules/article-body-adverts',
    'commercial/modules/close-disabled-slots',
    'commercial/modules/dfp/init',
    'commercial/modules/dfp/load',
    'commercial/modules/front-commercial-components',
    'commercial/modules/gallery-adverts',
    'commercial/modules/hosted/about',
    'commercial/modules/hosted/video',
    'commercial/modules/hosted/gallery',
    'commercial/modules/hosted/colours',
    'commercial/modules/slice-adverts',
    'commercial/modules/liveblog-adverts',
    'commercial/modules/sticky-top-banner',
    'commercial/modules/third-party-tags',
    'commercial/modules/paidfor-band',
    'commercial/modules/paid-containers',
    'commercial/modules/dfp/ophan-tracking'
], function (
    Promise,
    config,
    detect,
    mediator,
    robust,
    userTiming,
    articleAsideAdverts,
    articleBodyAdverts,
    closeDisabledSlots,
    dfpInit,
    dfpLoad,
    frontCommercialComponents,
    galleryAdverts,
    hostedAbout,
    hostedVideo,
    hostedGallery,
    hostedColours,
    sliceAdverts,
    liveblogAdverts,
    stickyTopBanner,
    thirdPartyTags,
    paidforBand,
    paidContainers,
    ophanTracking
) {
    var primaryModules = [
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-init', dfpInit],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-galleryAdverts', galleryAdverts.init],
        ['cm-liveblogAdverts', liveblogAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ];

    var secondaryModules = [
        ['cm-load', dfpLoad],
        ['cm-paidforBand', paidforBand.init],
        ['cm-paidContainers', paidContainers.init],
        ['cm-ready', function () {
            mediator.emit('page:commercial:ready');
            userTiming.mark('commercial end');
            return Promise.resolve();
        }]
    ];

    if (config.isHosted) {
        secondaryModules.unshift(
            ['cm-hostedAbout', hostedAbout.init],
            ['cm-hostedVideo', hostedVideo.init],
            ['cm-hostedGallery', hostedGallery.init],
            ['cm-hostedColours', hostedColours.init]);
    }

    if ((config.switches.disableStickyAdBannerOnMobile && detect.getBreakpoint() === 'mobile') ||
         config.page.disableStickyTopBanner ||
         config.tests.abNewHeaderVariant
    ) {
        config.page.hasStickyAdBanner = false;
    } else {
        config.page.hasStickyAdBanner = true;
        secondaryModules.unshift(['cm-stickyTopBanner', stickyTopBanner.init]);
    }

    function loadModules(modules, baseline) {

        ophanTracking.addStartTimeBaseline(baseline);

        var modulePromises = [];

        modules.forEach(function (pair) {

            var moduleName = pair[0];

            robust.catchErrorsAndLog(moduleName, function () {
                var modulePromise = pair[1]().then(function(){
                    ophanTracking.moduleCheckpoint(moduleName, baseline);
                });

                modulePromises.push(modulePromise);
            });
        });

       return Promise.all(modulePromises)
           .then(function(moduleLoadResult){
               ophanTracking.addEndTimeBaseline(baseline);
               return moduleLoadResult;
           });
    }

    return {
        init: function () {
            if (!config.switches.commercial) {
                return;
            }

            userTiming.mark('commercial start');

            // Stub the command queue
            window.googletag = { cmd: [] };

            loadModules(primaryModules, ophanTracking.primaryBaseline).then(function(){
                loadModules(secondaryModules, ophanTracking.secondaryBaseline);
            });
        }
    };

});
