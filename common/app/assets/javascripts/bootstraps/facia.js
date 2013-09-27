define([
    //Common libraries
    'common',
    'bonzo',
    //Modules
    'modules/facia/popular',
    'modules/facia/relativise-timestamp',
    'modules/facia/items-show-more',
    'modules/facia/collection-display-toggle',
    'modules/footballfixtures'
], function (
    common,
    bonzo,
    popular,
    RelativiseTimestamp,
    ItemsShowMore,
    CollectionDisplayToggle,
    FootballFixtures
) {

    var modules = {

        showPopular: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                popular.render(context);
            });
        },

        relativiseTimestamps: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.toArray(context.querySelectorAll('.js-item__timestamp')).forEach(function(timestamp) {
                    new RelativiseTimestamp(timestamp)
                        .relativise();
                });
            });
        },

        showItemsShowMore: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.js-items--show-more', context).each(function(items) {
                    new ItemsShowMore(items)
                        .addShowMore();
                });
            });
        },

        showFootballFixtures: function(path) {
            common.mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && config.page.pageId === "") {
                    // wrap the return sports stats component in an 'item'
                    var $statsItem = bonzo(bonzo.create('<li class="item item--sport-stats"></li>'));
                    common.mediator.on('modules:footballfixtures:render', function() {
                        // only show 7 rows
                        common.$g('.match:nth-child(n + 8)', $statsItem)
                            .addClass('u-h');
                        // add it after the first item
                        common.$g('.collection--news.collection--sport-section .item:first-child', context)
                            .after($statsItem);
                        // now hide one of the shown ones
                        common.$g('.collection--news.collection--sport-section .item.u-h', context)
                            .first()
                            .previous()
                            .addClass('u-h');
                    });
                    new FootballFixtures({
                        prependTo: $statsItem,
                        attachMethod: 'append',
                        competitions: ['500', '510', '100', '400'],
                        contextual: false,
                        expandable: false
                    }).init();
                }
            });
        },

        showCollectionDisplayToggle: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.js-collection--display-toggle', context).each(function(collection) {
                    new CollectionDisplayToggle(collection)
                        .addToggle();
                });
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
            modules.relativiseTimestamps();
            modules.showItemsShowMore();
            modules.showFootballFixtures();
            modules.showCollectionDisplayToggle();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
