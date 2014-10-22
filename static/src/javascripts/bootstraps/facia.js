define([
    // Common libraries
    'common/utils/$',
    'common/utils/config',
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
    'facia/modules/ui/container-fetch-updates',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/container-toggle',
    'facia/modules/onwards/geo-most-popular-front'
], function (
    $,
    config,
    ajax,
    mediator,
    bonzo,
    qwery,
    detect,
    storage,
    toArray,
    snaps,
    ContainerFcShowMore,
    containerFetchUpdates,
    ContainerShowMore,
    ContainerToggle,
    GeoMostPopularFront
    ) {
    var modules = {

            showSnaps: function () {
                snaps.init();
            },

            showContainerShowMore: function () {
                var containerShowMoreAdd = function () {
                    var c = document;
                    $('.js-container--show-more', c).each(function (container) {
                        new ContainerShowMore(container).addShowMore();
                    });

                    $('.js-container--fc-show-more', c).each(function (container) {
                        new ContainerFcShowMore(container).addShowMoreButton();
                    });
                };
                mediator.addListeners({
                    'page:front:ready': containerShowMoreAdd
                });
            },

            showContainerToggle: function () {
                var c = document,
                    containerToggleAdd = function () {
                        $('.js-container--toggle', c).each(function (container) {
                            new ContainerToggle(container).addToggle();
                        });
                    };
                mediator.addListeners({
                    'page:front:ready': containerToggleAdd,
                    'ui:container-toggle:add':  containerToggleAdd,
                    'modules:geomostpopular:ready': containerToggleAdd
                });
                mediator.on(/page:front:ready|ui:container-toggle:add|modules:geomostpopular:ready/, function () {
                    $('.js-container--toggle', c).each(function (container) {
                        new ContainerToggle(container).addToggle();
                    });
                });
            },

            upgradeMostPopularToGeo: function () {
                if (config.switches.geoMostPopular) {
                    new GeoMostPopularFront().go();
                }
            },

            fetchUpdates: function () {
                containerFetchUpdates();
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.showSnaps();
                modules.showContainerShowMore();
                modules.showContainerToggle();
                modules.upgradeMostPopularToGeo();
                modules.fetchUpdates();
            }
            mediator.emit('page:front:ready');
        };

    return {
        init: ready
    };

});
