define([
    'common',
    'bonzo',
    'modules/facia/popular',
    'modules/facia/image-upgrade'
], function (
    common,
    bonzo,
    popular,
    ImageUpgrade
) {
    var modules = {

        upgradeImages: function () {
            common.mediator.on('page:section:ready', function(config, context) {
                common.$g('.collection', context).each(function(collection) {
                    var isContainer = (bonzo(collection).attr('data-collection-type') === 'container');
                    common.$g('.item', collection).each(function(item, index) {
                        new ImageUpgrade(item, isContainer && (index === 0))
                            .upgrade();
                    });
                });
            });
        },

        showPopular: function () {
            common.mediator.on('page:section:ready', function(config, context) {
                popular.render(config);
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.upgradeImages();
            modules.showPopular();
        }
        common.mediator.emit("page:section:ready", config, context);
    };

    return {
        init: ready
    };

});
