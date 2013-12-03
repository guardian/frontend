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
        idConfig: function (config) {
            mediator.on('page:identity:ready', function(config, context) {
                Id.init(config);
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
            modules.forgottenEmail();
            modules.forgottenPassword();
            modules.passwordStrength();
            modules.passwordToggle();
            modules.idConfig(config);
            modules.userAdTargeting();
        }
        mediator.emit("page:identity:ready", config, context);
    };

    return {
        init: ready
    };

});
