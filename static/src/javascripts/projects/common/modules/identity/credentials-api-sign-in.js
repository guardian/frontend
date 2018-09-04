// @flow
import { identityFeatures } from 'common/modules/identity/identity-features';
import { ajaxSignIn } from 'common/modules/identity/api';
import ophan from 'ophan-tracker-js';

const recordOphanCredentialsApiInteraction = (interactionType): void => {
    ophan.record({
        component: 'pwmanager-api',
        value: interactionType,
    });
};

const storeCredsAndResolvePromise = (creds): Promise<boolean> => {
    // $FlowFixMe
    navigator.credentials.store(creds);
    recordOphanCredentialsApiInteraction('conversion');
    return Promise.resolve(true);
};

export const signInWithSavedCredentials = (): Promise<boolean> => {
    if (identityFeatures.promptForSignIn) {
        // $FlowFixMe
        return navigator.credentials
            .get({
                password: true,
                mediation: 'required',
            })
            .then(creds => {
                if (creds) {
                    return ajaxSignIn(creds)
                        .then(() => storeCredsAndResolvePromise(creds))
                        .catch(() => Promise.resolve(false));
                }
                recordOphanCredentialsApiInteraction('impression');
                return Promise.resolve(false);
            });
    }
    return Promise.resolve(false);
};
