define([
    //Common libraries
    'common',
    'bonzo',
    //Modules
    'modules/detect',
    'modules/facia/popular',
    'modules/facia/items-show-more',
    'modules/facia/collection-display-toggle',
    'modules/footballfixtures',
    'modules/facia/image-upgrade'
], function (
    common,
    bonzo,
    detect,
    popular,
    ItemsShowMore,
    CollectionDisplayToggle,
    FootballFixtures,
    ImageUpgrade
) {

    var modules = {

        showPopular: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                popular.render(config);
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
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var $statsItem = bonzo(bonzo.create('<li class="item item--sport-stats"></li>'));
                    common.mediator.on('modules:footballfixtures:render', function() {
                        // only show 7 rows
                        common.$g('.match:nth-child(n + 8)', $statsItem)
                            .addClass('u-h');
                        // toggle class
                        common.$g('.collection--sport-section .items')
                            .removeClass('items--without-sport-stats')
                            .addClass('items--with-sport-stats');
                        // add it after the first item
                        common.$g('.collection--sport-section .item:first-child', context)
                            .after($statsItem);
                        // now hide one of the shown ones (but not on mobile)
                        if (detect.getBreakpoint() !== 'mobile') {
                            common.$g('.collection--sport-section .item.u-h', context)
                                .first()
                                .previous()
                                .addClass('u-h');
                        }
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
                    new CollectionDisplayToggle(collection, config)
                        .addToggle();
                });
            });
        },

        upgradeImages: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.collection', context).each(function(collection) {
                    var isContainer = (bonzo(collection).attr('data-collection-type') === 'container');
                    common.$g('.item', collection).each(function(item, index) {
                        // is this the first item in a container?
                        var isMain = isContainer && (index === 0);
                        common.$g('.item__image-container', item).each(function(imageContainer) {
                            new ImageUpgrade(imageContainer, isMain)
                                .upgrade();
                        });
                    });
                });
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
            modules.showItemsShowMore();
            modules.showFootballFixtures();
            modules.showCollectionDisplayToggle();
            modules.upgradeImages();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
