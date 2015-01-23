define([
    'bonzo',
    'qwery',
    // Common libraries
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/to-array',
    'common/modules/analytics/beacon',
    // Modules
    'common/modules/business/stocks',
    'facia/modules/onwards/geo-most-popular-front',
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/snaps',
    'facia/modules/onwards/weather'
], function (
    bonzo,
    qwery,
    $,
    config,
    detect,
    mediator,
    storage,
    toArray,
    beacon,
    stocks,
    GeoMostPopularFront,
    ContainerToggle,
    ContainerShowMore,
    snaps,
    weather
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
            },

            // temporary to check an 'older' iphone perf problem
            iPhoneConfidenceCheck: function () {
                if (config.switches.iphoneConfidence) {
                    /* jshint undef: true */
                    /* global guardian */
                    mediator.on('page:front:ready', function () {
                        if (guardian.isIphone6) {
                            beacon.counts('iphone-6-end');
                            setTimeout(function () {
                                beacon.counts('iphone-6-timeout');
                            }, 5000);
                        }
                        if (guardian.isIphone4) {
                            beacon.counts('iphone-4-end');
                            setTimeout(function () {
                                beacon.counts('iphone-4-timeout');
                            }, 5000);
                        }
                    });
                }
            },

            showWeather: function () {
                if (config.switches.weather) {
                    mediator.on('page:front:ready', function () {
                        weather.init();
                    });
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
                stocks();
                modules.iPhoneConfidenceCheck();
                modules.showWeather();
            }
            mediator.emit('page:front:ready');
        };

    return {
        init: ready
    };

});
