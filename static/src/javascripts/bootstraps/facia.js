define([
    'bonzo',
    'qwery',
    // Common libraries
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/to-array',
    // Modules
    'facia/modules/onwards/geo-most-popular-front',
    'facia/modules/ui/container-fc-show-more',
    'facia/modules/ui/container-fetch-updates',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/snaps'
], function (
    bonzo,
    qwery,
    $,
    ajax,
    config,
    detect,
    mediator,
    storage,
    toArray,
    GeoMostPopularFront,
    ContainerFcShowMore,
    containerFetchUpdates,
    ContainerShowMore,
    ContainerToggle,
    snaps
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
                    'modules:container:rendered' : containerShowMoreAdd,
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
