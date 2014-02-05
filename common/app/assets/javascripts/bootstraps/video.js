define([
    "common/utils/mediator",
    "common/utils/detect",
    "common/utils/lazy-load-css"
], function(
    mediator,
    detect,
    lazyLoadCss
) {
    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            lazyLoadCss('video', config);
        }
        mediator.emit("page:video:ready", config, context);
    };

    return {
        init: ready
    };
});
