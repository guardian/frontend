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
    'common/modules/commercial/top-banner-below-container',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
    'common/modules/commercial/sponsorship',
    'lodash/collections/forEach'
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
    topBannerBelowContainer,
    sliceAdverts,
    thirdPartyTags,
    paidforBand
) {
    var modules = [
        ['cm-dfp', dfp.init ],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-topBannerBelowContainer', topBannerBelowContainer.init],
        ['cm-badges', badges.init]
    ];

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
                    ['cm-adverts', dfp.load],
                    ['cm-sponsorship', sponsorship.init]);
            })
            .then(paidforBand.init);
        }
    };

});
