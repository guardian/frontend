define([
    // Common libraries
    'common',
    'bonzo',
    // Modules
    'modules/detect',
    'modules/facia/popular',
    'modules/facia/collection-show-more',
    'modules/facia/container-toggle',
    'modules/footballfixtures',
    'modules/cricket'
], function (
    common,
    bonzo,
    detect,
    popular,
    CollectionShowMore,
    ContainerToggle,
    FootballFixtures,
    cricket
    ) {

    var modules = {

        showCollectionShowMore: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.js-collection--show-more', context).each(function(collection) {
                    new CollectionShowMore(collection)
                        .addShowMore();
                });
            });
        },

        showContainerToggle: function () {
            common.mediator.on('page:front:ready', function(config, context) {
                common.$g('.js-container--toggle', context).each(function(container) {
                    new ContainerToggle(container)
                        .addToggle();
                });
            });
        },

        showFootballFixtures: function(path) {
            common.mediator.on('page:front:ready', function(config, context) {
                if (config.page.edition === 'UK' && (config.page.pageId === "" || config.page.pageId === "sport")) {
                    // wrap the return sports stats component in an 'item'
                    var prependTo = bonzo(bonzo.create('<li class="item item--sport-stats item--sport-stats-tall"></li>'));
                    common.mediator.on('modules:footballfixtures:render', function() {
                        var collection = common.$g('.container--news[data-id$="/sport/regular-stories"] .collection', context);
                        common.$g('.item:first-child', collection)
                            // add empty item
                            .after(prependTo);
                        collection.removeClass('collection--without-sport-stats')
                            .addClass('collection--with-sport-stats');
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
            common.mediator.on('page:front:ready', function(config, context) {
                popular.render(config);
            });
        },

        showCricket: function(){
            common.mediator.on('page:front:ready', function(config, context) {
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
            modules.showPopular();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
