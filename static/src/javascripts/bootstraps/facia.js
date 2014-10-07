define([
    // Common libraries
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    // Modules
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/to-array',
    'facia/modules/ui/snaps',
    'facia/modules/ui/container-fc-show-more',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/live-blog-updates',
    'facia/modules/onwards/geo-most-popular-front'
], function (
    $,
    ajax,
    mediator,
    bonzo,
    qwery,
    detect,
    storage,
    toArray,
    snaps,
    containerFcShowMore,
    ContainerShowMore,
    ContainerToggle,
    liveBlogUpdates,
    GeoMostPopularFront
    ) {
    var modules = {
            showSnaps: function () {
                snaps.init();
            },

            showContainerShowMore: function () {
                var containerShowMoreAdd = function (config, context) {
                    var c = context || document;
                    $('.js-container--show-more', c).each(function (container) {
                        new ContainerShowMore(container).addShowMore();
                    });

                    $('.js-container--fc-show-more', c).each(function (container) {
                        containerFcShowMore(container);
                    });
                };
                mediator.addListeners({
                    'page:front:ready': containerShowMoreAdd
                });
            },

            showContainerToggle: function () {
                var containerToggleAdd = function (config, context) {
                    var c = context || document;
                    $('.js-container--toggle', c).each(function (container) {
                        new ContainerToggle(container).addToggle();
                    });
                };
                mediator.addListeners({
                    'page:front:ready': containerToggleAdd,
                    'ui:container-toggle:add':  containerToggleAdd
                });
                mediator.on(/page:front:ready|ui:container-toggle:add/, function (config, context) {
                    $('.js-container--toggle', context).each(function (container) {
                        new ContainerToggle(container).addToggle();
                    });
                });
            },

            upgradeMostPopularToGeo: function (config) {
                if (config.page.contentType === 'Network Front' && config.switches.geoMostPopular) {
                    new GeoMostPopularFront(mediator, config).go();
                }
            }
        },

        ready = function (config, context) {
            if (!this.initialised) {
                this.initialised = true;
                modules.showSnaps();
                modules.showContainerShowMore();
                modules.showContainerToggle();
                modules.upgradeMostPopularToGeo(config);
                liveBlogUpdates();
            }
            mediator.emit('page:front:ready', config, context);
        };

    return {
        init: ready
    };

});
