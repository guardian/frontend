define([
    'common/utils/mediator',
    'common/modules/onward/popular-fronts'
], function (
    mediator,
    popular
) {
    var modules = {

        showPopular: function () {
            mediator.on('page:section:ready', function(config, context) {
                popular.render(config);
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
        }
        mediator.emit('page:section:ready', config, context);
    };

    return {
        init: ready
    };

});
