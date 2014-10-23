define([
    'common/utils/mediator',
    'common/modules/onward/popular-fronts'
], function (
    mediator,
    popular
) {
    var modules = {

            showPopular: function () {
                popular.render();
            }

        },
        ready = function () {
            modules.showPopular();

            mediator.emit('page:section:ready');
        };

    return {
        init: ready
    };

});
