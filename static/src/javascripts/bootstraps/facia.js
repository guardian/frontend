define([
    'bonzo',
    'qwery',
    // Common libraries
    'common/utils/_',
    'common/utils/$',
    'common/utils/background',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/robust',
    'common/utils/storage',
    'common/utils/to-array',
    // Modules
    'common/modules/accessibility/helpers',
    'common/modules/experiments/ab',
    'common/modules/business/stocks',
    'facia/modules/onwards/geo-most-popular-front',
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/lazy-load-containers',
    'facia/modules/ui/live-blog-updates',
    'facia/modules/ui/snaps',
    'facia/modules/ui/sponsorship',
    'facia/modules/onwards/weather'
], function (
    bonzo,
    qwery,
    _,
    $,
    background,
    config,
    detect,
    mediator,
    robust,
    storage,
    toArray,
    accessibility,
    ab,
    stocks,
    GeoMostPopularFront,
    ContainerToggle,
    containerShowMore,
    lazyLoadContainers,
    liveblogUpdates,
    snaps,
    sponsorship,
    weather
) {

    var modules = {
            showSnaps: function () {
                snaps.init();
                mediator.on('modules:container:rendered', snaps.init);
            },

            showContainerShowMore: function () {
                mediator.addListeners({
                    'modules:container:rendered': containerShowMore.init,
                    'page:front:ready': containerShowMore.init
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

            showWeather: function () {
                if (config.switches.weather) {
                    mediator.on('page:front:ready', function () {
                        weather.init();
                    });
                }
            },

            showLiveblogUpdates: function () {
                if (detect.isBreakpoint({ min: 'desktop' })) {
                    mediator.on('page:front:ready', function () {
                        liveblogUpdates.show();
                    });
                }
            },

            finished: function () {
                mediator.emit('page:front:ready');
            }

        },

        ready = function () {
            _.forEach(robust.makeBlocks([
                ['f-accessibility', accessibility.shouldHideFlashingElements],
                ['f-snaps', modules.showSnaps],
                ['f-show-more', modules.showContainerShowMore],
                ['f-container-toggle', modules.showContainerToggle],
                ['f-geo-most-popular', modules.upgradeMostPopularToGeo],
                ['f-lazy-load-containers', lazyLoadContainers],
                ['f-stocks', stocks],
                ['f-sponsorship', sponsorship],
                ['f-weather', modules.showWeather],
                ['f-live-blog-updates', modules.showLiveblogUpdates],
                ['f-finished', modules.finished]
            ]), function (fn) {
                fn();
            });
        };

    return {
        init: ready
    };
});
