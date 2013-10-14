define([
    "common"
], function(
    common
) {

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
        }
        common.mediator.emit("page:gallery:ready", config, context);
    };

    return {
        init: ready
    };

});