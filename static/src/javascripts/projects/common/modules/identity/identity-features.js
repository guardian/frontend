// @flow

class IdentityFeatures {
    promptForSignIn: boolean;

    constructor() {
        this.promptForSignIn =
            // $FlowFixMe
            navigator.credentials && window.PasswordCredential;
    }
}

export const identityFeatures = new IdentityFeatures();
