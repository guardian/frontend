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
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/container-show-more',
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
    ContainerToggle,
    ContainerShowMore,
    snaps
) {

    var modules = {

            showSnaps: function () {
                snaps.init();
                mediator.on('modules:container:rendered', snaps.init);
            },

            showContainerShowMore: function () {
                var containerShowMoreAdd = function () {
                    var c = document;

                    $('.js-container--fc-show-more', c).each(function (container) {
                        new ContainerShowMore(container).addShowMoreButton();
                    });
                };
                mediator.addListeners({
                    'modules:container:rendered': containerShowMoreAdd,
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
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.showSnaps();
                modules.showContainerShowMore();
                modules.showContainerToggle();
                modules.upgradeMostPopularToGeo();
            }
            mediator.emit('page:front:ready');
        };

    return {
        init: ready
    };

});
