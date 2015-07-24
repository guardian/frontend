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
    'facia/modules/ui/slideshow/controller',
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
    slideshow,
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
                var pageId = config.page.pageId,
                    isNetFront = _.contains(['uk', 'us', 'au'], pageId),
                    isSport = _.contains(['sport', 'football'], config.page.section);

                if (detect.isBreakpoint({ max: 'tablet' })) {
                    return;
                } else if (config.switches.liveblogFrontUpdatesOther && !isSport && !isNetFront ||
                    config.switches.liveblogFrontUpdatesUk && pageId === 'uk' ||
                    config.switches.liveblogFrontUpdatesUs && pageId === 'us' ||
                    config.switches.liveblogFrontUpdatesAu && pageId === 'au') {
                    mediator.on('page:front:ready', function () {
                        liveblogUpdates.show();
                    });
                }
            },

            startSlideshow: function () {
                if (detect.isBreakpoint({ min: 'tablet' })) {
                    mediator.on('page:front:ready', function () {
                        slideshow.init();
                    });
                }
            },

            finished: function () {
                mediator.emit('page:front:ready');
            }

        },

        ready = function () {
            background([
                accessibility.shouldHideFlashingElements,
                modules.showSnaps,
                modules.showContainerShowMore,
                modules.showContainerToggle,
                modules.upgradeMostPopularToGeo,
                lazyLoadContainers,
                stocks,
                sponsorship,
                modules.showWeather,
                modules.showLiveblogUpdates,
                modules.startSlideshow,
                modules.finished
            ]);
        };

    return {
        init: ready
    };
});
