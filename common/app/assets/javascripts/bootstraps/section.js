define([
    'common',
    'modules/facia/popular'
], function (
    common,
    popular
) {
    var modules = {

        showPopular: function () {
            common.mediator.on('page:section:ready', function(config, context) {
                popular.render(config);
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
        }
        common.mediator.emit('page:section:ready', config, context);
    };

    return {
        init: ready
    };

});
