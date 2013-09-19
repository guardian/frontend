define([
    //Common libraries
    'common',
    //Modules
    'modules/facia-popular',
    'modules/facia-relativise-timestamp',
    'modules/facia-items-show-more'
], function (
    common,
    popular,
    RelativiseTimestamp,
    ItemsShowMore
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
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
            modules.relativiseTimestamps();
            modules.showItemsShowMore();
        }
        common.mediator.emit("page:front:ready", config, context);
    };

    return {
        init: ready
    };

});
