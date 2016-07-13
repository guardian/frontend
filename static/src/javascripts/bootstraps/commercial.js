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
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/hosted-gallery',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/sticky-top-banner',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
    'common/modules/commercial/paid-containers'
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
    hostedVideo,
    hostedGallery,
    sliceAdverts,
    stickyTopBanner,
    thirdPartyTags,
    paidforBand,
    paidContainers
) {
    var modules = [
        ['cm-dfp', dfpInit],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ],
    secondaryModules = [
        ['cm-adverts', dfpLoad],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-sponsorships', sponsorships.init],
        ['cm-hostedVideo', hostedVideo.init],
        ['cm-hostedGallery', hostedGallery.init],
        ['cm-paidforBand', paidforBand.init],
        ['cm-new-adverts', paidContainers.init],
        ['cm-ready', function () {
            mediator.emit('page:commercial:ready');
            userTiming.mark('commercial end');
        }]
    ];

    if (!(config.switches.staticBadges && config.switches.staticContainerBadges)) {
        modules.push(['cm-badges', badges.init]);
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


    return {
        init: function () {
            if (!config.switches.commercial) {
                return;
            }

            userTiming.mark('commercial start');

            var modulePromises = [];

            modules.forEach(function (pair) {
                robust.catchErrorsAndLog(pair[0], function () {
                    modulePromises.push(pair[1]());
                });
            });

            Promise.all(modulePromises).then(function () {
                robust.catchErrorsAndLogAll(secondaryModules);
            });
        }
    };

});
