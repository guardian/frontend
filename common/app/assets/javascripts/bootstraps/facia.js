define([
    //Common libraries
    'common',
    'bonzo',
    //Modules
    'modules/detect',
    'modules/facia/popular',
    'modules/facia/relativise-timestamp',
    'modules/facia/items-show-more',
    'modules/facia/collection-display-toggle',
    'modules/footballfixtures',
    'modules/facia/image-upgrade'
], function (
    common,
    bonzo,
    detect,
    popular,
    RelativiseTimestamp,
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
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var $statsItem = bonzo(bonzo.create('<li class="item item--sport-stats"></li>')),
                        section = config.page.pageId === "" ? 'sport' : 'news',
                        numVisible = config.page.pageId === "" ? 3 : 5;
                    common.mediator.on('modules:footballfixtures:render', function() {
                        var container = common.$g('.collection--' + section, context)
                            .first()[0];
                        // toggle class
                        common.$g('.items', container)
                            .removeClass('items--without-sport-stats')
                            .addClass('items--with-sport-stats');
                        // add it after the first item
                        common.$g('.item:first-child', container)
                            .first()
                            .after($statsItem);
                        // now hide one of the shown ones (but not on mobile)
                        if (detect.getBreakpoint() !== 'mobile') {
                            common.$g('.item.u-h', container)
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
                        expandable: true,
                        numVisible: numVisible
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
            modules.relativiseTimestamps();
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
