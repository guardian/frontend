define([
    "common",
    "modules/cricket"
], function (
    common,
    Cricket
) {
    var modules = {

        showCricket: function() {
            common.mediator.on('page:tag:ready', function(config, context) {
                Cricket.cricketTrail(config, context);
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.showCricket(context);
        }
        common.mediator.emit("page:tag:ready", config, context);
    };

    return {
        init: ready
    };

});
