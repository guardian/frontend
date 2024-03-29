/**
 * DO NOT EDIT THIS FILE
 *
 * It is not used to to build anything.
 *
 * It's just a record of the old flow types.
 *
 * Use it as a guide when converting
 * - static/src/javascripts/bootstraps/enhanced/profile.js
 * to .ts, then delete it.
 */

// @flow

import { catchErrorsWithContext } from 'lib/robust';
import { forgottenEmail, passwordToggle } from 'common/modules/identity/forms';
import { Formstack } from 'common/modules/identity/formstack';
import { FormstackIframe } from 'common/modules/identity/formstack-iframe';
import { FormstackEmbedIframe } from 'common/modules/identity/formstack-iframe-embed';
import { init as initValidationEmail } from 'common/modules/identity/validation-email';
import { AccountProfile } from 'common/modules/identity/account-profile';
import { init as initPublicProfile } from 'common/modules/identity/public-profile';
import { enhanceFormAjax } from 'common/modules/identity/form-ajax';
import { enhanceConsents } from 'common/modules/identity/consents';
import { enhanceConsentJourney } from 'common/modules/identity/consent-journey';
import { setupLoadingAnimation } from 'common/modules/identity/delete-account';
import { initHeader } from 'common/modules/identity/header';
import { initUserAvatars } from 'common/modules/discussion/user-avatars';
import { initUserEditLink } from 'common/modules/discussion/user-edit-link';
import { init as initTabs } from 'common/modules/ui/tabs';
import { enhanceAdPrefs } from 'common/modules/identity/ad-prefs';
import { enhanceUpsell } from 'common/modules/identity/upsell/upsell';

const initFormstack = (): void => {
    const attr = 'data-formstack-id';
    const forms = Array.from(document.querySelectorAll(`[${attr}]`));
    const iframes = Array.from(
        document.getElementsByClassName('js-formstack-iframe')
    );

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

const initAccountProfile = (): void => {
    // eslint-disable-next-line no-new
    new AccountProfile();
};

const initProfile = (): void => {
    const modules: Array<Array<string | Function>> = [
        ['init-form-stack', initFormstack],
        ['forgotten-email', forgottenEmail],
        ['password-toggle', passwordToggle],
        ['init-validation-email', initValidationEmail],
        ['init-user-avatars', initUserAvatars],
        ['init-user-edit-link', initUserEditLink],
        ['init-tabs', initTabs],
        ['init-account-profile', initAccountProfile],
        ['setup-loading-animation', setupLoadingAnimation],
        ['init-public-profile', initPublicProfile],
        ['enhance-consents', enhanceConsents],
        ['enhance-ad-prefs', enhanceAdPrefs],
        ['enhance-form-ajax', enhanceFormAjax],
        ['enhance-consent-journey', enhanceConsentJourney],
        ['init-header', initHeader],
        ['init-upsell', enhanceUpsell],
    ];
    catchErrorsWithContext(modules);
};

export { initProfile };
