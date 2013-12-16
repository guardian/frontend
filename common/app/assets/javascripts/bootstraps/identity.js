define([
    "utils/mediator",
    "modules/identity/forms",
    "modules/identity/password-strength",
    "modules/identity/api",
    //"modules/identity/email-signup",
    "modules/adverts/userAdTargeting"
], function(
    mediator,
    Identity,
    PasswordStrength,
    Id,
    //EmailSignup,
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
        // emailSignup : function () {
        //     mediator.on('page:identity:ready', function(config, context) {
        //         EmailSignup.init(context);
        //     });
        // }
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
            //modules.emailSignup();
        }
        mediator.emit("page:identity:ready", config, context);
    };

    return {
        init: ready
    };

});
