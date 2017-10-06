// @flow

import { forgottenEmail, passwordToggle } from 'common/modules/identity/forms';
import { Formstack } from 'common/modules/identity/formstack';
import { FormstackIframe } from 'common/modules/identity/formstack-iframe';
import { FormstackEmbedIframe } from 'common/modules/identity/formstack-iframe-embed';
import { init as initValidationEmail } from 'common/modules/identity/validation-email';
import { AccountProfile } from 'common/modules/identity/account-profile';
import { init as initPublicProfile } from 'common/modules/identity/public-profile';
import { enhanceEmailPreferences } from 'common/modules/identity/email-preferences';
import { setupLoadingAnimation } from 'common/modules/identity/delete-account';
import { initUserAvatars } from 'common/modules/discussion/user-avatars';
import { init as initTabs } from 'common/modules/ui/tabs';

const initFormstack = (): void => {
    const attr = 'data-formstack-id';
    const forms = [...document.querySelectorAll(`[${attr}]`)];
    const iframes = [...document.getElementsByClassName('js-formstack-iframe')];

    forms.forEach(form => {
        const id = form.getAttribute(attr) || '';
        const isEmbed = form.className.match(/\bformstack-embed\b/);

        if (isEmbed) {
            new FormstackEmbedIframe(form, id).init();
        } else {
            new Formstack(form, id).init();
        }
    });

    // Load old js if necessary
    iframes.forEach(el => {
        const iframe: HTMLIFrameElement = (el: any);

        new FormstackIframe(iframe).init();
    });
};

const initProfile = (): void => {
    initFormstack();
    forgottenEmail();
    passwordToggle();
    initValidationEmail();
    initUserAvatars();
    initTabs();
    // eslint-disable-next-line no-new
    new AccountProfile();
    enhanceEmailPreferences();
    setupLoadingAnimation();
    initPublicProfile();
};

export { initProfile };
