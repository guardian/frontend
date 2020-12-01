class IdentityFeatures {
    promptForSignIn: boolean;

    constructor() {
        this.promptForSignIn =
            navigator.credentials && window.PasswordCredential;
    }
}

export const identityFeatures = new IdentityFeatures();
