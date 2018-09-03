// @flow
import {
    IdentityCookies,
    identityFeatures,
} from 'common/modules/identity/identity-features';
import { ajaxSignIn } from 'common/modules/identity/api';
import ophan from 'ophan-tracker-js';
import { addCookie } from 'lib/cookies';

export const signInWithSavedCredentials = (): Promise<boolean> => {
    if (identityFeatures.promptForSignIn) {
        // $FlowFixMe
        return navigator.credentials
            .get({
                password: true,
                mediation: 'optional',
            })
            .then(creds => {
                if (creds) {
                    return ajaxSignIn(creds)
                        .then(() => {
                            ophan.record({
                                component: 'pwmanager-api',
                                value: 'conversion',
                            });
                            // $FlowFixMe
                            navigator.credentials.store(creds);
                            return Promise.resolve(true);
                        })
                        .catch(() => Promise.resolve(false));
                }
                ophan.record({
                    component: 'pwmanager-api',
                    value: 'impression',
                });
                addCookie(IdentityCookies.PW_MANAGER_DISMISSED, 'true', 7);
                return Promise.resolve(false);
            });
    }
    return Promise.resolve(false);
};
