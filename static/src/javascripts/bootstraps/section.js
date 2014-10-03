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

        },
        ready = function (config) {
            modules.showPopular(config);

            mediator.emit('page:section:ready', config);
        };

    return {
        init: ready
    };

});
