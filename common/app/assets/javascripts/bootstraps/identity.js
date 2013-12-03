define([
    "utils/mediator",
    "modules/identity/forms",
    "modules/identity/password-strength",
    "modules/identity/api",
    "modules/adverts/userAdTargeting"
], function(
    mediator,
    Identity,
    PasswordStrength,
    Id,
    UserAdTargeting
) {

    var modules = {
        idInit: function (config) {
            Id.init(config);
        },
        forgottenEmail: function () {
            mediator.on('page:identity:ready', function(config, context) {
                Identity.forgottenEmail(config, context);
            });
        },
        forgottenPassword: function () {
            mediator.on('page:identity:ready', function(config, context) {
                Identity.forgottenPassword(config, context);
            });
        },
        passwordStrength: function () {
            mediator.on('page:identity:ready', function(config, context) {
                var passwords = context.querySelectorAll('.js-password-strength');
                Array.prototype.forEach.call(passwords, function (i) {
                    new PasswordStrength(i, context, config).init();
                });
            });
        },
        passwordToggle: function () {
            mediator.on('page:identity:ready', function(config, context) {
                Identity.passwordToggle(config, context);
            });
        },
        userAdTargeting : function () {
            mediator.on('page:identity:ready', function(config, context) {
                UserAdTargeting.requestUserSegmentsFromId();
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.idInit(config);
            modules.forgottenEmail();
            modules.forgottenPassword();
            modules.passwordStrength();
            modules.passwordToggle();
            modules.userAdTargeting();
        }
        mediator.emit("page:identity:ready", config, context);
    };

    return {
        init: ready
    };

});
