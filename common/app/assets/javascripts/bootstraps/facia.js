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
                popular.render(config);
            });
        },

        showCricket: function(){
            mediator.on('page:front:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        },

        showUserzoom: function(config) {
            var path,
                load;

            if (config.switches.userzoom) {
                path = window.location.pathname.substring(1);
                load = {
                    'uk': {vistsRequired: 2, script: 'userzoom-uk'},
                    'uk-alpha': {vistsRequired: 0, script: 'userzoom-uk-alpha'},
                }[path];

                if(!load) { return; }

                mediator.on('page:front:ready', function(config, context) {
                    var visits = parseInt(storage.local.get('gu.userzoom.visits.' + path) || 0, 10);

                    if(visits >= load.vistsRequired) {
                        require(['js!' + load.script]);
                    } else {
                        storage.local.set('gu.userzoom.visits.' + path, visits + 1);
                    }
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
