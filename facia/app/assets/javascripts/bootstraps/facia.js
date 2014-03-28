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
    'common/modules/sport/football/fixtures'
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
    FootballFixtures
    ) {

    var modules = {

        showCollectionShowMore: function () {
            var collectionShowMoreAdd = function(config, context) {
                var c = context || document;
                $('.container', c).each(function(container) {
                    $('.js-collection--show-more', container).each(function(collection) {
                        new CollectionShowMore(collection).addShowMore();
                    });
                });
                $('.js-container--show-more', c).each(function(container) {
                    new ContainerShowMore(container).addShowMore();
                });
            };
            mediator.addListeners({
                'page:front:ready': collectionShowMoreAdd,
                'ui:collection-show-more:add':  collectionShowMoreAdd
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

        showFootballFixtures: function() {
            mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (['', 'sport', 'uk-alpha'].indexOf(config.page.pageId) !== -1)) {
                    // wrap the return sports stats component in an appropriate element
                    var isNewsContainer = ['uk-alpha', 'sport'].indexOf(config.page.pageId) !== -1,
                        prependToHtml = isNewsContainer
                            ? '<div class="fromage tone-accent-border tone-news unstyled item--sport-stats"></div>'
                            : '<li class="item item--sport-stats item--sport-stats-tall"></li>',
                        $prependTo = bonzo(bonzo.create(prependToHtml));
                    mediator.on('modules:footballfixtures:render', function() {
                        var $container = $(isNewsContainer ? '.container--news' : '.container--sport', context).first();
                        if ($container[0]) {
                            if (isNewsContainer) {
                                bonzo($('.collection-wrapper', $container[0]).get(1))
                                    .append($prependTo);
                            } else {
                                var $collection = $('.container--sport .collection', context).first();
                                $('.item:first-child', $collection[0])
                                    // add empty item
                                    .after($prependTo);
                                $collection
                                    .removeClass('collection--without-sport-stats')
                                    .addClass('collection--with-sport-stats');
                            }
                        }
                    });
                    new FootballFixtures({
                        prependTo: $prependTo,
                        attachMethod: 'append',
                        competitions: ['500', '510', '100', '400'],
                        contextual: false,
                        expandable: true,
                        numVisible: config.page.pageId === '' ? 3 : 5
                    }).init();
                }
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
        mediator.emit('page:front:ready', config, context);
    };

    return {
        init: ready
    };

});
