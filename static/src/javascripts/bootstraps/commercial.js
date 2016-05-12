define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp/dfp-api',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/hosted-video',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
    'common/modules/commercial/adverts',
    'common/modules/commercial/commercial-audit'
], function (
    Promise,
    config,
    mediator,
    robust,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    dfp,
    frontCommercialComponents,
    hostedVideo,
    sliceAdverts,
    thirdPartyTags,
    paidforBand,
    adverts,
    commercialAudit
) {
    var modules = [
        ['cm-dfp', dfp.init],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-commercialAudit', commercialAudit.init],
        ['cm-hostedVideo', hostedVideo.init]
    ];

    if (!config.switches.staticBadges) {
        modules.push(['cm-badges', badges.init]);
    }

    return {
        init: function () {
            if (!config.switches.commercial) {
                return;
            }

            var modulePromises = [];

            modules.forEach(function (pair) {
                robust.catchErrorsAndLog(pair[0], function () {
                    modulePromises.push(pair[1]());
                });
            });

            Promise.all(modulePromises).then(function () {
                robust.catchErrorsAndLogAll([
                    ['cm-adverts', dfp.loadAds],
                    ['cm-paidforBand', paidforBand.init],
                    ['cm-new-adverts', adverts.init],
                    ['cm-ready', function () {
                        mediator.emit('page:commercial:ready');
                    }]
                ]);
            });
        }
    };

});
