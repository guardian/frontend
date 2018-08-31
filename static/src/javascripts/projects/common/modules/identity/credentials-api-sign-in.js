// @flow
import {
    IdentityCookies,
    identityFeatures,
} from 'common/modules/identity/identity-features';
import { ajaxSignIn } from 'common/modules/identity/api';
import ophan from 'ophan-tracker-js';
import { addCookie } from 'lib/cookies';

const ONE_DAY_IN_MILLIS = 86400000;

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
                        .then(cookies => {
                            const expiryDate = new Date(cookies.expiresAt);
                            const daysUntilExpiry =
                                (expiryDate.getTime() - new Date().getTime()) /
                                ONE_DAY_IN_MILLIS;
                            ophan.record({
                                component: 'pwmanager-api',
                                value: 'conversion',
                            });
                            cookies.values.forEach(cookie => {
                                addCookie(
                                    cookie.key,
                                    cookie.value,
                                    daysUntilExpiry
                                );
                            });
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
