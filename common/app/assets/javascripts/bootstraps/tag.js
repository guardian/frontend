define([
    'common/utils/mediator',
    'common/modules/onward/popular-fronts'
], function (
    mediator,
    popular
) {
    var modules = {

        showPopular: function () {
            mediator.on('page:tag:ready', function(config) {
                popular.render(config);
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
        }
        mediator.emit('page:tag:ready', config, context);
    };

    return {
        init: ready
    };

});
