define([
    "common",
    "modules/interactive",
], function(
    common,
    Interactive
) {

    var modules = {
        augmentInteractive: function () {
            common.mediator.on('page:interactive:ready', function(config, context) {
                new Interactive(context, config).init();
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.augmentInteractive();
        }
        common.mediator.emit("page:interactive:ready", config, context);
    };

    return {
        init: ready
    };

});
