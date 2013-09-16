define([
    "common",
    "modules/identity",
], function(
    common,
    Identity
) {

    var modules = {
        forgottenEmail: function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                Identity.forgottenEmail(config, context);
            });
        },
        forgottenPassword: function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                Identity.forgottenPassword(config, context);
            });
        },
        passwordToggle: function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                Identity.passwordToggle(config, context);
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.forgottenEmail();
            modules.forgottenPassword();
            modules.passwordToggle();
        }
        common.mediator.emit("page:identity:ready", config, context);
    };

    return {
        init: ready
    };

});
