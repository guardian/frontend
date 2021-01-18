class IdentityFeatures {


    constructor() {
        this.promptForSignIn =

            navigator.credentials && window.PasswordCredential;
    }
}

export const identityFeatures = new IdentityFeatures();
