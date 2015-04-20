define([
    'bonzo',
    'qwery',
    // Common libraries
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/storage',
    'common/utils/to-array',
    // Modules
    'common/modules/business/stocks',
    'facia/modules/onwards/geo-most-popular-front',
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/lazy-load-containers',
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
    robust,
    storage,
    toArray,
    stocks,
    GeoMostPopularFront,
    ContainerToggle,
    containerShowMore,
    lazyLoadContainers,
    snaps,
    weather
) {

    var showSnaps = function () {
            snaps.init();
            mediator.on('modules:container:rendered', snaps.init);
        },

        showContainerShowMore = function () {
            mediator.addListeners({
                'modules:container:rendered': containerShowMore.init,
                'page:front:ready': containerShowMore.init
            });
        },

        showContainerToggle = function () {
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

        upgradeMostPopularToGeo = function () {
            if (config.switches.geoMostPopular) {
                new GeoMostPopularFront().go();
            }
        },

        showWeather = function () {
            if (config.switches.weather) {
                weather.init();
            }
        },

        ready = function () {
            if (!initialised) {
                initialised = true;
                if (config.switches.robustFastdom) {
                    robust('f-snaps', showSnaps);
                    robust('f-show-more', showContainerShowMore);
                    robust('f-toggle', showContainerToggle);
                    robust('f-most-popular', upgradeMostPopularToGeo);
                    robust('f-lazy-load', lazyLoadContainers);
                    robust('f-stocks', stocks);
                    robust('f-weather', showWeather);
                } else {
                    showSnaps();
                    showContainerShowMore();
                    showContainerToggle();
                    upgradeMostPopularToGeo();
                    lazyLoadContainers();
                    stocks();
                    showWeather();
                }
            }
            mediator.emit('page:front:ready');
        },
        initialised = false;

    return {
        init: ready
    };

});
