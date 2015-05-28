define([
    'Promise',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/_',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/commercial/third-party-tags-lazy',
    'common/modules/user-prefs'
], function (
    Promise,
    config,
    mediator,
    robust,
    _,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    dfp,
    frontCommercialComponents,
    sliceAdverts,
    thirdPartyTags,
    thirdPartyTagsLazy,
    userPrefs
) {
    var modules = [
        ['cm-articleAsideAdverts', articleAsideAdverts],
        ['cm-articleBodyAdverts', articleBodyAdverts],
        ['cm-sliceAdverts', sliceAdverts],
        ['cm-frontCommercialComponents', frontCommercialComponents],
        ['cm-badges', badges]
    ];

    if (!config.switches.thirdpartydefer) {
       modules.push(['cm-thirdPartyTags', thirdPartyTags]); 
    }

    return {
        init: function () {
            var modulePromises = [];

            if (
                !userPrefs.isOff('adverts') &&
                !config.page.shouldHideAdverts &&
                (!config.page.isSSL || config.page.section === 'admin') &&
                !window.location.hash.match(/[#&]noads(&.*)?$/)
            ) {
                _.forEach(modules, function (pair) {
                    robust(pair[0], function () {
                        modulePromises.push(pair[1].init());
                    });
                });

                Promise.all(modulePromises).then(function () {
                    robust('cm-dfp', function () {
                        dfp.init();
                    });
                    // TODO does dfp return a promise?
                    robust('cm-ready', function () { mediator.emit('page:commercial:ready'); });
                });
            }
        }
    };

});
