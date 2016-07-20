define([
    'Promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/user-timing',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/close-disabled-slots',
    'common/modules/commercial/dfp/init',
    'common/modules/commercial/dfp/load',
    'common/modules/commercial/dfp/sponsorships',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/hosted-about',
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/hosted-gallery',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/sticky-top-banner',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
    'common/modules/commercial/paid-containers',
    'common/modules/commercial/dfp/private/ophan-tracking'
], function (
    Promise,
    config,
    detect,
    mediator,
    robust,
    userTiming,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    closeDisabledSlots,
    dfpInit,
    dfpLoad,
    sponsorships,
    frontCommercialComponents,
    hostedAbout,
    hostedVideo,
    hostedGallery,
    sliceAdverts,
    stickyTopBanner,
    thirdPartyTags,
    paidforBand,
    paidContainers,
    ophanTracking
) {
    var primaryModules = [
        ['cm-init', dfpInit],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ];

    var secondaryModules = [
        ['cm-load', dfpLoad],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-sponsorships', sponsorships.init],
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
            ['cm-hostedGallery', hostedGallery.init]);
    }

    if (!(config.switches.staticBadges && config.switches.staticContainerBadges)) {
        primaryModules.push(['cm-badges', badges.init]);
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

        ophanTracking.addBaseline(baseline);

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

       return Promise.all(modulePromises);
    }

    return {
        init: function () {
            if (!config.switches.commercial) {
                return;
            }

            userTiming.mark('commercial start');

            loadModules(primaryModules, ophanTracking.primaryBaseline).then(function(){
                loadModules(secondaryModules, ophanTracking.secondaryBaseline);
            });
        }
    };

});
