define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp-api',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/top-banner-below-container',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/paidfor-band',
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
    paidforBand,
    forEach) {
    var modules = [
        ['cm-articleAsideAdverts', articleAsideAdverts.init],
        ['cm-articleBodyAdverts', articleBodyAdverts.init],
        ['cm-sliceAdverts', sliceAdverts.init],
        ['cm-frontCommercialComponents', frontCommercialComponents.init],
        ['cm-topBannerBelowContainer', topBannerBelowContainer.init],
        ['cm-thirdPartyTags', thirdPartyTags.init],
        ['cm-badges', badges.init],
        ['cm-paidforBand', paidforBand.init]
    ];

    return {
        init: function () {
            var modulePromises = [];

            forEach(modules, function (pair) {
                robust.catchErrorsAndLog(pair[0], function () {
                    modulePromises.push(pair[1]());
                });
            });

            Promise.all(modulePromises).then(function () {
                if (config.switches.commercial) {
                    robust.catchErrorsAndLogAll([
                        ['cm-dfp', dfp.init],
                        // TODO does dfp return a promise?
                        ['cm-ready', function () {
                            mediator.emit('page:commercial:ready');
                        }]
                    ]);
                }
            });
        }
    };

});
