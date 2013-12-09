define([
    // Common libraries
    '$',
    'utils/mediator',
    'bonzo',
    'qwery',
    // Modules
    'utils/detect',
    'utils/storage',
    'modules/facia/popular',
    'modules/facia/collection-show-more',
    'modules/facia/container-toggle',
    'modules/sport/football/fixtures',
    'modules/sport/cricket'
], function (
    $,
    mediator,
    bonzo,
    qwery,
    detect,
    storage,
    popular,
    CollectionShowMore,
    ContainerToggle,
    FootballFixtures,
    cricket
    ) {

    var hiddenCollections = {},
        modules = {


        showCollectionShowMore: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.container', context).each(function(container) {
                    $('.js-collection--show-more', container).each(function(collection) {
                        var collectionShowMore = new CollectionShowMore(collection);
                        hiddenCollections[container.getAttribute('data-id')] = collectionShowMore;
                        collectionShowMore.addShowMore();
                    });
                });
            });
        },

        showContainerToggle: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container)
                        .addToggle();
                });
            });
        },

        showFootballFixtures: function(path) {
            mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var prependTo = bonzo(bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'));
                    mediator.on('modules:footballfixtures:render', function() {
                        var $container = $('.container--sport', context).first();
                        if ($container[0]) {
                            var $collection = $('.collection', $container[0]);
                            $('.item:first-child', $collection[0])
                                // add empty item
                                .after(prependTo);
                            $collection.removeClass('collection--without-sport-stats')
                                .addClass('collection--with-sport-stats');
                            // remove the last two items
                            var hiddenCollection = hiddenCollections[$container.attr('data-id')];
                            if (hiddenCollection) {
                                var items = qwery('.item', $collection[0])
                                                .slice(-2);
                                hiddenCollection.prependExtraItems(items);
                                bonzo(items).remove();
                            }
                        }
                    });
                    new FootballFixtures({
                        prependTo: prependTo,
                        attachMethod: 'append',
                        competitions: ['500', '510', '100', '400'],
                        contextual: false,
                        expandable: true,
                        numVisible: config.page.pageId === "" ? 3 : 5
                    }).init();
                }
            });
        },

        showPopular: function () {
            mediator.on('page:front:ready', function(config, context) {
                var opts = {};
                // put popular after the first container if this is us-alpha front
                if (config.page.pageId === 'us-alpha') {
                    opts.insertAfter = $('.container').first();
                }
                popular.render(config, opts);
            });
        },

        showCricket: function(){
            mediator.on('page:front:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        },

        showUserzoom: function(config) {
            var path,
                steps;

            if (config.switches.userzoom && config.switches.faciaUkAlpha) {
                path = window.location.pathname.substring(1);
                steps = {
                    'uk': [
                        {
                            pageId: 'uk-alpha',
                            visits: 2,
                            script: 'userzoom-uk-alpha'
                        },
                        {
                            pageId: '',
                            visits: 2,
                            script: 'userzoom-uk'
                        }
                    ]
                }[path];

                if(!steps) { return; }

                mediator.on('page:front:ready', function(config, context) {
                    steps.some(function(step) {
                        var storeKey,
                            visits;

                        if (step.pageId === config.page.pageId) {
                            storeKey = 'gu.userzoom.' + path + '.' + step.pageId;
                            visits = parseInt(storage.local.get(storeKey) || 0, 10);
                            if(visits >= step.visits) {
                                require(['js!' + step.script]);
                            } else {
                                storage.local.set(storeKey, visits + 1);
                            }
                            return true;
                        }
                    });
                });
            }
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showCollectionShowMore();
            modules.showContainerToggle();
            modules.showFootballFixtures();
            modules.showPopular();
            modules.showUserzoom(config);
        }
        mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
