define([
    // Common libraries
    'common/$',
    'common/utils/ajax',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    // Modules
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/to-array',
    'modules/ui/snaps',
    'modules/ui/container-show-more',
    'modules/ui/container-toggle',
    'modules/onwards/geo-most-popular-front'
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
    ContainerShowMore,
    ContainerToggle,
    GeoMostPopularFront
) {
    var modules = {

        showSnaps: function() {
            snaps.init();
        },

        showContainerShowMore: function () {
            var containerShowMoreAdd = function(config, context) {
                var c = context || document;
                $('.js-container--show-more', c).each(function(container) {
                    new ContainerShowMore(container).addShowMore();
                });
            };
            mediator.addListeners({
                'page:front:ready': containerShowMoreAdd
            });
        },

        showContainerToggle: function () {
            var containerToggleAdd = function(config, context) {
                var c = context || document;
                $('.js-container--toggle', c).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            };
            mediator.addListeners({
                'page:front:ready': containerToggleAdd,
                'ui:container-toggle:add':  containerToggleAdd
            });
            mediator.on(/page:front:ready|ui:container-toggle:add/, function(config, context) {
                $('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            });
        },

        upgradeMostPopularToGeo: function(config) {
            if (config.page.contentType === 'Network Front' && config.switches.geoMostPopular) {
                new GeoMostPopularFront(mediator, config).go();
            }
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showSnaps();
            modules.showContainerShowMore();
            modules.showContainerToggle();
            modules.upgradeMostPopularToGeo(config);
        }
        mediator.emit('page:front:ready', config, context);
    };

    return {
        init: ready
    };

});
