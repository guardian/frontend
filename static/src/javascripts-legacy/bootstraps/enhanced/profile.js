define([
    'lib/$',
    'qwery',
    'common/modules/identity/forms',
    'common/modules/identity/formstack', // oldskool inside
    'common/modules/identity/formstack-iframe', // oldskool outside
    'common/modules/identity/formstack-iframe-embed', // newskool inside
    'common/modules/identity/validation-email',
    'common/modules/identity/api',
    'common/modules/identity/account-profile',
    'common/modules/identity/public-profile',
    'common/modules/identity/email-preferences',
    'common/modules/identity/delete-account',
    'common/modules/discussion/user-avatars',
    'lib/mediator',
    'common/modules/ui/tabs'
], function (
    $,
    qwery,
    Identity,
    Formstack,
    FormstackIframe,
    FormstackEmbedIframe,
    ValidationEmail,
    Id,
    AccountProfile,
    PublicProfile,
    EmailPreferences,
    DeleteAccount,
    UserAvatars,
    mediator,
    Tabs
) {
    var modules = {
        initFormstack: function () {
            mediator.on('page:identity:ready', function (config) {
                var attr = 'data-formstack-id';
                $('[' + attr + ']').each(function (el) {
                    var id = el.getAttribute(attr),
                        isEmbed = el.className.match(/\bformstack-embed\b/);

                    if (isEmbed) {
                        new FormstackEmbedIframe(el, id, config).init();
                    } else {
                        new Formstack(el, id, config).init();
                    }

                });

                // Load old js if necessary
                $('.js-formstack-iframe').each(function (el) {
                    new FormstackIframe(el, config).init();
                });
            });
        },
        forgottenEmail: function () {
            mediator.on('page:identity:ready', function (config) {
                Identity.forgottenEmail(config);
            });
        },
        forgottenPassword: function () {
            mediator.on('page:identity:ready', function (config) {
                Identity.forgottenPassword(config);
            });
        },
        passwordToggle: function () {
            mediator.on('page:identity:ready', function (config) {
                Identity.passwordToggle(config);
            });
        },
        userAvatars: function () {
            mediator.on('page:identity:ready', function () {
                UserAvatars.init();
            });
        },
        validationEmail: function () {
            mediator.on('page:identity:ready', function () {
                ValidationEmail.init();
            });
        },

        tabs: function () {
            var tabs = new Tabs();
            mediator.on('page:identity:ready', function () {
                tabs.init();
            });
        },

        accountProfile: function () {
            var accountProfile = new AccountProfile();
            mediator.on('page:identity:ready', function () {
                accountProfile.init();
            });
        },

        emailPreferences: function () {
            mediator.on('page:identity:ready', function () {
                EmailPreferences.init();
            });
        },

        deleteAccount: function () {
            mediator.on('page:identity:ready', function () {
                DeleteAccount.init();
            });
        }
    };

    return {
        init: function (config) {
            modules.initFormstack();
            modules.forgottenEmail();
            modules.forgottenPassword();
            modules.passwordToggle();
            modules.userAvatars();
            modules.validationEmail();
            modules.tabs();
            modules.accountProfile();
            modules.emailPreferences();
            modules.deleteAccount();
            PublicProfile.init();

            mediator.emit('page:identity:ready', config);
        }
    };
});
