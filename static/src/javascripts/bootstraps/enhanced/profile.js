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
const modules = {
    initFormstack() {
        mediator.on('page:identity:ready', config => {
            const attr = 'data-formstack-id';
            $('[' + attr + ']').each(el => {
                const id = el.getAttribute(attr), isEmbed = el.className.match(/\bformstack-embed\b/);

                if (isEmbed) {
                    new FormstackEmbedIframe.FormstackEmbedIframe(el, id, config).init();
                } else {
                    new Formstack.Formstack(el, id, config).init();
                }

            });

            // Load old js if necessary
            $('.js-formstack-iframe').each(el => {
                new FormstackIframe.FormstackIframe(el, config).init();
            });
        });
    },
    forgottenEmail() {
        mediator.on('page:identity:ready', config => {
            forms.forgottenEmail(config);
        });
    },
    passwordToggle() {
        mediator.on('page:identity:ready', config => {
            forms.passwordToggle(config);
        });
    },
    userAvatars() {
        mediator.on('page:identity:ready', () => {
            UserAvatars.initUserAvatars();
        });
    },
    validationEmail() {
        mediator.on('page:identity:ready', () => {
            validationEmail.init();
        });
    },

    tabs() {
        mediator.on('page:identity:ready', () => {
            tabs.init();
        });
    },

    accountProfile() {
        const accountProfile = new AccountProfile.AccountProfile();
        mediator.on('page:identity:ready', () => {
            accountProfile.init();
        });
    },

    emailPreferences() {
        mediator.on('page:identity:ready', () => {
            emailPreferences.enhanceEmailPreferences();
        });
    },

    deleteAccount() {
        mediator.on('page:identity:ready', () => {
            DeleteAccount.setupLoadingAnimation();
        });
    }
};

export default {
    init(config) {
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
