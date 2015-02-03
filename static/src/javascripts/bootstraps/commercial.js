define([
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/robust',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/third-party-tags',
    'common/modules/user-prefs'
], function (
    config,
    mediator,
    robust,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    dfp,
    frontCommercialComponents,
    sliceAdverts,
    thirdPartyTags,
    userPrefs
) {

    return {
        init: function () {
            if (
                !userPrefs.isOff('adverts') &&
                !config.page.shouldHideAdverts &&
                (!config.page.isSSL || config.page.section === 'admin') &&
                !window.location.hash.match(/[#&]noads(&.*)?$/)
            ) {
                // load tags
                robust('cm-thirdPartyTags',            function () { thirdPartyTags.init(); });
                robust('cm-articleAsideAdverts',       function () { articleAsideAdverts.init(); });
                robust('cm-articleBodyAdverts',        function () { articleBodyAdverts.init(); });
                robust('cm-sliceAdverts',              function () { sliceAdverts.init(); });
                robust('cm-frontCommercialComponents', function () { frontCommercialComponents.init(); });
                robust('cm-badges',                    function () { badges.init(); });
                robust('cm-dfp',                       function () { dfp.init(); });
            }

            robust('cm-ready', function () { mediator.emit('page:commercial:ready'); });
        }
    };

});
