define([
    'bonzo',
    'qwery',
    'lodash/collections/forEach',
    'common/utils/config',
    'common/utils/mediator',
    'common/modules/commercial/tags/container',
    'common/modules/commercial/article-aside-adverts',
    'common/modules/commercial/article-body-adverts',
    'common/modules/commercial/slice-adverts',
    'common/modules/commercial/front-commercial-components',
    'common/modules/commercial/badges',
    'common/modules/commercial/dfp',
    'common/modules/commercial/loader',
    'common/modules/userPrefs'
], function (
    bonzo,
    qwery,
    forEach,
    config,
    mediator,
    tagsContainer,
    articleAsideAdverts,
    articleBodyAdverts,
    sliceAdverts,
    frontCommercialComponents,
    badges,
    dfp,
    CommercialLoader,
    userPrefs
) {

    var modules = {

            commercialLoaderHelper: function () {
                // forces a commercial component on a page, for testing
                forEach(
                    [
                        ['commercial-component', 'merchandising'],
                        ['commercial-component-high', 'merchandising-high']
                    ],
                    function (data) {
                        var loader, postLoadEvents,
                            commercialComponent = new RegExp('^#' + data[0] + '=(.*)$').exec(window.location.hash),
                            slot = qwery('[data-name="' + data[1] + '"]').shift();
                        if (commercialComponent && slot) {
                            bonzo(slot).removeClass('ad-slot--dfp');
                            loader = new CommercialLoader();
                            postLoadEvents = {};
                            postLoadEvents[commercialComponent[1]] = function () {
                                slot.style.display = 'block';
                            };
                            loader.postLoadEvents = postLoadEvents;
                            loader.init(commercialComponent[1], slot);
                        }
                    }
                );
            },

            tagContainer: function () {
                // load tags
                tagsContainer.init();
            },

            articleAsideAdverts: function () {
                articleAsideAdverts.init();
            },

            articleBodyAdverts: function () {
                articleBodyAdverts.init();
            },

            sliceAdverts: function () {
                sliceAdverts.init();
            },

            frontCommercialComponents: function () {
                frontCommercialComponents.init();
            },

            badges: function () {
                badges.init();
            },

            dfp: function () {
                dfp.init();
            }

        },
        ready = function () {
            if (
                !userPrefs.isOff('adverts') &&
                !config.page.shouldHideAdverts &&
                (!config.page.isSSL || config.page.section === 'admin')
            ) {
                modules.commercialLoaderHelper();
                modules.tagContainer();
                modules.articleAsideAdverts();
                modules.articleBodyAdverts();
                modules.sliceAdverts();
                modules.frontCommercialComponents();
                modules.badges();
                modules.dfp();
            }

            mediator.emit('page:commercial:ready');
        };

    return {
        init: ready
    };

});
