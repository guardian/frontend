define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/user-timing',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/close-disabled-slots',
    'common/modules/commercial/dfp/dfp-api',
    'common/modules/commercial/dfp/sponsorships',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
    'common/modules/commercial/paid-containers'
], function (
    Promise,
    config,
    mediator,
    robust,
    userTiming,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    closeDisabledSlots,
    dfp,
    sponsorships,
    frontCommercialComponents,
    hostedVideo,
    sliceAdverts,
    thirdPartyTags,
    paidforBand,
    paidContainers
) {
    var modules = [
        ['cm-dfp', dfp.init],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-closeDisabledSlots', closeDisabledSlots.init]
    ];

    if (!(config.switches.staticBadges && config.switches.staticContainerBadges)) {
        modules.push(['cm-badges', badges.init]);
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
                robust.catchErrorsAndLogAll([
                    ['cm-adverts', dfp.loadAds],
                    ['cm-thirdPartyTags', thirdPartyTags.init],
                    ['cm-sponsorships', sponsorships.init],
                    ['cm-hostedVideo', hostedVideo.init],
                    ['cm-paidforBand', paidforBand.init],
                    ['cm-new-adverts', paidContainers.init],
                    ['cm-ready', function () {
                        mediator.emit('page:commercial:ready');
                        userTiming.mark('commercial end');
                    }]
                ]);
            });
        }
    };

});
