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
                var interactiveNodeList = context.querySelectorAll('figure.interactive');
                new Interactive(interactiveNodeList, context, config, common.mediator).init();
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
