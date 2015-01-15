define([
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/tags/container',
    'common/modules/user-prefs'
], function (
    config,
    mediator,
    articleAsideAdverts,
    articleBodyAdverts,
    badges,
    dfp,
    frontCommercialComponents,
    sliceAdverts,
    tagsContainer,
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
                tagsContainer.init();
                articleAsideAdverts.init();
                articleBodyAdverts.init();
                sliceAdverts.init();
                frontCommercialComponents.init();
                badges.init();
                dfp.init();
            }

            mediator.emit('page:commercial:ready');
        }
    };

});
