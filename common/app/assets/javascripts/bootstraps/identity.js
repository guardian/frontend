define([
    "common",
    "modules/identity",
    "modules/password-strength",
    "modules/id",
    "modules/adverts/userAdTargeting",
    "modules/detect"
], function(
    common,
    Identity,
    PasswordStrength,
    Id,
    UserAdTargeting,
    detect
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
        passwordStrength: function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                var passwords = context.querySelectorAll('.js-password-strength');
                Array.prototype.forEach.call(passwords, function (i) {
                    new PasswordStrength(i, context, config).init();
                });
            });
        },
        passwordToggle: function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                Identity.passwordToggle(config, context);
            });
        },
        usernameAvailable: function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                Identity.usernameAvailable(config, context);
            });
        },
        idConfig : function (config) {
            common.mediator.on('page:identity:ready', function(config, context) {
                Id.init(config);
            });
        },
        userAdTargeting : function () {
            common.mediator.on('page:identity:ready', function(config, context) {
                UserAdTargeting.requestUserSegmentsFromId();
            });
        },
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.forgottenEmail();
            modules.forgottenPassword();
            modules.passwordStrength();
            modules.passwordToggle();
            modules.usernameAvailable();
            modules.idConfig(config);
            modules.userAdTargeting();
            modules.facebookAutoSignin();
        }
        common.mediator.emit("page:identity:ready", config, context);
    };

    return {
        init: ready
    };

});
