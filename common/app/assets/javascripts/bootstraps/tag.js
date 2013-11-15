define([
    'common',
    'modules/facia/popular',
    'modules/sport/cricket'
], function (
    common,
    popular,
    cricket
) {
    var modules = {

        showPopular: function () {
            common.mediator.on('page:tag:ready', function(config, context) {
                popular.render(config);
            });
        },

        showCricket: function() {
            common.mediator.on('page:tag:ready', function(config, context) {
                cricket.cricketTrail(config, context);
            });
        }

    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showPopular();
        }
        common.mediator.emit('page:tag:ready', config, context);
    };

    return {
        init: ready
    };

});
