// @flow
import { getCookie } from 'lib/cookies';

const CookieNames = {
    PW_MANAGER_DISMISSED: 'GU_PWMANAGER_DISMISSED',
    GU_SO: 'GU_SO',
};

class IdentityFeatures {
    promptForSignIn: boolean;

    constructor() {
        this.promptForSignIn =
            // $FlowFixMe
            navigator.credentials &&
            window.PasswordCredential &&
            getCookie(CookieNames.PW_MANAGER_DISMISSED) === null;
    }
}

export const identityFeatures = new IdentityFeatures();

export const IdentityCookies = CookieNames;
