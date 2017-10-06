import $ from 'lib/$';
import qwery from 'qwery';
import forms from 'common/modules/identity/forms';
import Formstack from 'common/modules/identity/formstack';
import FormstackIframe from 'common/modules/identity/formstack-iframe';
import FormstackEmbedIframe from 'common/modules/identity/formstack-iframe-embed';
import validationEmail from 'common/modules/identity/validation-email';
import Id from 'common/modules/identity/api';
import AccountProfile from 'common/modules/identity/account-profile';
import PublicProfile from 'common/modules/identity/public-profile';
import emailPreferences from 'common/modules/identity/email-preferences';
import DeleteAccount from 'common/modules/identity/delete-account';
import UserAvatars from 'common/modules/discussion/user-avatars';
import mediator from 'lib/mediator';
import tabs from 'common/modules/ui/tabs';
var modules = {
    initFormstack: function() {
        mediator.on('page:identity:ready', function(config) {
            var attr = 'data-formstack-id';
            $('[' + attr + ']').each(function(el) {
                var id = el.getAttribute(attr),
                    isEmbed = el.className.match(/\bformstack-embed\b/);

                if (isEmbed) {
                    new FormstackEmbedIframe.FormstackEmbedIframe(el, id, config).init();
                } else {
                    new Formstack.Formstack(el, id, config).init();
                }

            });

            // Load old js if necessary
            $('.js-formstack-iframe').each(function(el) {
                new FormstackIframe.FormstackIframe(el, config).init();
            });
        });
    },
    forgottenEmail: function() {
        mediator.on('page:identity:ready', function(config) {
            forms.forgottenEmail(config);
        });
    },
    passwordToggle: function() {
        mediator.on('page:identity:ready', function(config) {
            forms.passwordToggle(config);
        });
    },
    userAvatars: function() {
        mediator.on('page:identity:ready', function() {
            UserAvatars.initUserAvatars();
        });
    },
    validationEmail: function() {
        mediator.on('page:identity:ready', function() {
            validationEmail.init();
        });
    },

    tabs: function() {
        mediator.on('page:identity:ready', function() {
            tabs.init();
        });
    },

    accountProfile: function() {
        var accountProfile = new AccountProfile.AccountProfile();
        mediator.on('page:identity:ready', function() {
            accountProfile.init();
        });
    },

    emailPreferences: function() {
        mediator.on('page:identity:ready', function() {
            emailPreferences.enhanceEmailPreferences();
        });
    },

    deleteAccount: function() {
        mediator.on('page:identity:ready', function() {
            DeleteAccount.setupLoadingAnimation();
        });
    }
};

export default {
    init: function(config) {
        modules.initFormstack();
        modules.forgottenEmail();
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
