import { catchErrorsWithContext } from 'lib/robust';
import { forgottenEmail, passwordToggle } from 'common/modules/identity/forms';
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

const initAccountProfile = () => {
    // eslint-disable-next-line no-new
    new AccountProfile();
};

const initProfile = () => {
    const modules = [
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
    ];
    catchErrorsWithContext(modules);
};

export { initProfile };
