define([
    'bonzo',
    'qwery',
    // Common libraries
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/request-animation-frame',
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
    _,
    $,
    config,
    detect,
    mediator,
    requestAnimationFrame,
    storage,
    toArray,
    beacon,
    stocks,
    GeoMostPopularFront,
    ContainerToggle,
    containerShowMore,
    snaps,
    weather
) {

    var modules = {

            showSnaps: function () {
                snaps.init();
                mediator.on('modules:container:rendered', snaps.init);
            },

            showContainerShowMore: function () {
                mediator.addListeners({
                    'modules:container:rendered': containerShowMore,
                    'page:front:ready': containerShowMore
                });
            },

            showContainerToggle: function () {
                var containerToggleAdd = function (context) {
                        $('.js-container--toggle', $(context || document)[0]).each(function (container) {
                            new ContainerToggle(container).addToggle();
                        });
                    };
                mediator.addListeners({
                    'page:front:ready': containerToggleAdd,
                    'modules:geomostpopular:ready': _.partial(containerToggleAdd, '.js-popular-trails')
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
                            if (guardian.inTestBucket) {
                                beacon.counts('iphone-4-end-b');
                                setTimeout(function () { beacon.counts('iphone-4-timeout-b'); }, 5000);
                            } else {
                                beacon.counts('iphone-4-end-a');
                                setTimeout(function () { beacon.counts('iphone-4-timeout-a'); }, 5000);
                            }
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
                modules.showWeather();
                modules.iPhoneConfidenceCheck();
            }
            mediator.emit('page:front:ready');
        };

    return {
        init: ready
    };

});
