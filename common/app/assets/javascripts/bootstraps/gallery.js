define([
    "utils/mediator",
], function(
    mediator
) {

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
        }
        mediator.emit("page:gallery:ready", config, context);
    };

    return {
        init: ready
    };

});
