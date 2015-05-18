define([
    'bonzo',
    'qwery',
    // Common libraries
    'common/utils/_',
    'common/utils/$',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/storage',
    'common/utils/to-array',
    // Modules
    'common/modules/experiments/ab',
    'common/modules/business/stocks',
    'facia/modules/onwards/geo-most-popular-front',
    'facia/modules/ui/container-toggle',
    'facia/modules/ui/container-show-more',
    'facia/modules/ui/lazy-load-containers',
    'facia/modules/ui/live-blog-updates',
    'facia/modules/ui/slideshow/controller',
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
    storage,
    toArray,
    ab,
    stocks,
    GeoMostPopularFront,
    ContainerToggle,
    containerShowMore,
    lazyLoadContainers,
    liveblogUpdates,
    slideshow,
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

                if (config.switches.liveblogFrontUpdatesOther && !isSport && !isNetFront ||
                    config.switches.liveblogFrontUpdatesUk && pageId === 'uk' ||
                    config.switches.liveblogFrontUpdatesUs && pageId === 'us' ||
                    config.switches.liveblogFrontUpdatesAu && pageId === 'au' ||
                    config.switches.abLiveblogSportFrontUpdates && isSport && ab.getTestVariant('LiveblogSportFrontUpdates') === 'updates') {
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
            }
        },

        ready = function () {
            if (!this.initialised) {
                this.initialised = true;
                modules.showSnaps();
                modules.showContainerShowMore();
                modules.showContainerToggle();
                modules.upgradeMostPopularToGeo();
                lazyLoadContainers();
                stocks();
                modules.showWeather();
                modules.showLiveblogUpdates();
                modules.startSlideshow();
            }
            mediator.emit('page:front:ready');
        };

    return {
        init: ready
    };

});
