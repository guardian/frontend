define([
    // Common libraries
    'common/$',
    'common/utils/mediator',
    'bonzo',
    'qwery',
    // Modules
    'common/utils/detect',
    'common/utils/storage',
    'common/utils/to-array',
    'common/modules/ui/collection-show-more',
    'modules/ui/container-show-more',
    'modules/ui/container-toggle',
    'common/modules/sport/football/fixtures',
    'common/modules/sport/cricket',
    'common/modules/ui/message',
    'common/modules/analytics/mvt-cookie'
], function (
    $,
    mediator,
    bonzo,
    qwery,
    detect,
    storage,
    toArray,
    CollectionShowMore,
    ContainerShowMore,
    ContainerToggle,
    FootballFixtures,
    cricket,
    Message,
    mvtCookie
    ) {

    var modules = {

        showCollectionShowMore: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.container', context).each(function(container) {
                    $('.js-collection--show-more', container).each(function(collection) {
                        new CollectionShowMore(collection).addShowMore();
                    });
                });
                $('.js-container-add-show-more', context).each(function(container) {
                    new ContainerShowMore(container).addShowMore();
                });
            });
        },

        showContainerToggle: function () {
            mediator.on('page:front:ready', function(config, context) {
                $('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container).addToggle();
                });
            });
        },

        showFootballFixtures: function(path) {
            mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (['', 'sport', 'uk-alpha'].indexOf(config.page.pageId) !== -1)) {
                    // wrap the return sports stats component in an 'item'
                    var prependTo = bonzo(bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'));
                    mediator.on('modules:footballfixtures:render', function() {
                        var isUkAlpha = config.page.pageId === 'uk-alpha',
                            $container = $(isUkAlpha ? '.container--news' : '.container--sport', context).first();
                        if ($container[0]) {
                            if (isUkAlpha) {
                                var $collectionWrapper = $('.collection-wrapper', $container[0]).last();
                                $('.collection', $collectionWrapper[0]).append(prependTo);
                            } else {
                                var $collection = $('.container--sport .collection', context).first();
                                $('.item:first-child', $collection[0])
                                    // add empty item
                                    .after(prependTo);
                                $collection
                                    .removeClass('collection--without-sport-stats')
                                    .addClass('collection--with-sport-stats');
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

        showCricket: function(){
            mediator.on('page:front:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showCollectionShowMore();
            modules.showContainerToggle();
            modules.showFootballFixtures();
        }
        mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
