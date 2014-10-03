define([
	'common/utils/$',
    'common/modules/identity/forms',
    'common/modules/identity/formstack', // oldskool inside
    'common/modules/identity/formstack-iframe', // oldskool outside
    'common/modules/identity/formstack-iframe-embed', // newskool inside
    'common/modules/identity/password-strength',
    'common/modules/identity/validation-email',
    'common/modules/identity/api',
    'common/modules/identity/account-profile',
    'common/modules/commercial/user-ad-targeting',
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
        idInit: function(config) {
            Id.init(config);
            // Used to show elements that need signin. Use .sign-in-required
            if (Id.isUserLoggedIn()) {
                document.documentElement.className = document.documentElement.className.replace(/\bid--signed-out\b/, 'id--signed-in');
            }
        },
        initFormstack: function() {
            mediator.on('page:identity:ready', function(config) {
                var attr = 'data-formstack-id';
                $('[' + attr + ']').each(function(el) {
                    var id = el.getAttribute(attr);

                    var isEmbed = el.className.match(/\bformstack-embed\b/);

                    if (isEmbed) {
                        new FormstackEmbedIframe(el, id, config).init();
                    } else {
                        new Formstack(el, id, config).init();
                    }

                });

                // Load old js if necessary
                $('.js-formstack-iframe').each(function(el) {
                    new FormstackIframe(el, config).init();
                });
            });
        },
        forgottenEmail: function() {
            mediator.on('page:identity:ready', function(config) {
                Identity.forgottenEmail(config);
            });
        },
        forgottenPassword: function() {
            mediator.on('page:identity:ready', function(config) {
                Identity.forgottenPassword(config);
            });
        },
        passwordStrength: function() {
            mediator.on('page:identity:ready', function(config) {
                $('.js-password-strength').each(function(el) {
                    new PasswordStrength(el, config).init();
                });
            });
        },
        passwordToggle: function() {
            mediator.on('page:identity:ready', function(config) {
                Identity.passwordToggle(config);
            });
        },
        userAdTargeting : function() {
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
            mediator.on('page:identity:ready', function() {
                ValidationEmail.init();
            });
        },

        tabs: function() {
            var tabs = new Tabs();
            mediator.on('page:identity:ready', function() {
                tabs.init();
            });
        },

        accountProfile: function() {
            var accountProfile = new AccountProfile();
            mediator.on('page:identity:ready', function() {
                accountProfile.init();
            });
        }
    };

    var ready = function (config) {
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

        mediator.emit('page:identity:ready', config);
    };

    return {
        init: ready
    };

});
