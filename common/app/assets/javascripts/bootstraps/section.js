define([
    'common/utils/mediator',
    'common/modules/onward/popular-fronts'
], function (
    mediator,
    popular
) {
    var modules = {

        showPopular: function (config) {
            popular.render(config);
        }

    };

    var ready = function (config, context) {
        modules.showPopular(config);

        mediator.emit('page:section:ready', config, context);
    };

    return {
        init: ready
    };

});
