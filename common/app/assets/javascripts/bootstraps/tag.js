define([
    'utils/mediator',
    'modules/facia/popular',
    'modules/sport/cricket'
], function (
    mediator,
    popular,
    cricket
) {
    var modules = {

        showPopular: function () {
            mediator.on('page:tag:ready', function(config, context) {
                popular.render(config);
            });
        },

        showCricket: function() {
            mediator.on('page:tag:ready', function(config, context) {
                cricket.cricketTrail(config, context);
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
