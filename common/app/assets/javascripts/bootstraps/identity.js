define([
	'common/$',
    'common/modules/identity/forms',
    'common/modules/identity/formstack', // oldskool inside
    'common/modules/identity/formstack-iframe', // oldskool outside
    'common/modules/identity/formstack-iframe-embed', // newskool inside
    'common/modules/identity/password-strength',
    'common/modules/identity/validation-email',
    'common/modules/identity/api',
    'common/modules/identity/account-profile',
    'common/modules/adverts/userAdTargeting',
    'common/modules/discussion/user-avatars',
    'common/utils/mediator',
    'common/modules/ui/tabs'
], function(
    $,
    Identity,
    Formstack,
    FormstackIframe,
    FormstackEmbedIframe,
    PasswordStrength,
    ValidationEmail,
    Id,
    AccountProfile,
    UserAdTargeting,
    UserAvatars,
    mediator,
    Tabs
) {

    var modules = {
        idInit: function (config) {
            Id.init(config);
            // Used to show elements that need signin. Use .sign-in-required
            if (Id.isUserLoggedIn()) {
                document.documentElement.className = document.documentElement.className.replace(/\bid--signed-out\b/, 'id--signed-in');
            }
        },
        initFormstack: function () {
            mediator.on('page:identity:ready', function(config, context) {
                var attr = 'data-formstack-id';
                $('[' + attr + ']').each(function(el) {
                    var id = el.getAttribute(attr);

                    var isEmbed = el.className.match(/\bformstack-embed\b/);

                    if (isEmbed) {
                        new FormstackEmbedIframe(el, id, context, config).init();
                    } else {
                        new Formstack(el, id, context, config).init();
                    }

                });

                // Load old js if necessary
                $('.js-formstack-iframe').each(function(el) {
                    new FormstackIframe(el, context, config).init();
                });
            });
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
                $('.js-password-strength').each(function(el) {
                    new PasswordStrength(el, context, config).init();
                });
            });
        },
        passwordToggle: function () {
            mediator.on('page:identity:ready', function(config, context) {
                Identity.passwordToggle(config, context);
            });
        },
        userAdTargeting : function () {
            mediator.on('page:identity:ready', function() {
                UserAdTargeting.requestUserSegmentsFromId();
            });
        },
        userAvatars: function() {
            mediator.on('page:identity:ready', function() {
                UserAvatars.init();
            });
        },
        validationEmail: function() {
            mediator.on('page:identity:ready', function(config, context) {
                ValidationEmail.init(context);
            });
        },

        tabs: function () {
            var tabs = new Tabs();
            mediator.on('page:identity:ready', function(config, context) {
                tabs.init(context);
            });
        },

        accountProfile: function () {
            var accountProfile = new AccountProfile();
            mediator.on('page:identity:ready', function(config, context) {
                accountProfile.init(context);
            });
        }
    };

    var ready = function (config, context) {
        if (!this.initialised) {
            this.initialised = true;
            modules.idInit(config);
            modules.initFormstack();
            modules.forgottenEmail();
            modules.forgottenPassword();
            modules.passwordStrength();
            modules.passwordToggle();
            modules.userAdTargeting();
            modules.userAvatars();
            modules.validationEmail();
            modules.tabs();
            modules.accountProfile();
        }
        mediator.emit('page:identity:ready', config, context);
    };

    return {
        init: ready
    };

});
