define(["common", "modules/identity/autosignin"], function(common, AutoSignin) {

    var modules = {
        autoSignin: function() {
            common.mediator.on("page:facebook:ready", function(config, context) {
                new AutoSignin(config).init();
            });
        }
    };

    var ready = function(config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.autoSignin();
        }
        common.mediator.emit("page:facebook:ready", config, context);
    };

    return {
        init: ready
    };
    // move to id bs
});
