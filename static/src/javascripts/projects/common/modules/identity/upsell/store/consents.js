// @flow
import {
    getAllConsents,
    getUserFromApi,
    setConsent,
} from 'common/modules/identity/api';
import type {
    Followable
} from 'common/modules/identity/upsell/consent-card/FollowCard';
type Consent = {
    id: string,
    name: string,
    description: string,
    isOptOut: boolean,
    isChannel: boolean,
};

type ConsentType = {
    consent: Consent,
    hasConsented: ?boolean,
};

const getUserConsents = (): Promise<string[]> =>
    new Promise(accept => {
        getUserFromApi(user => {
            if (user && user.consents) {
                accept(
                    user.consents
                        .filter(consent => consent.consented === true)
                        .map(consent => consent.id)
                );
            } else {
                accept([]);
            }
        });
    });

const fetchConsents = Promise.all([getUserConsents(), getAllConsents()]);

const get = (): Promise<Followable<Consent>[]> =>
    fetchConsents.then(([acceptedConsents, allConsents]) =>
        allConsents.map(consent => ({
            value: consent,
            isFollowing: acceptedConsents.includes(consent.id),
            onChange: (newValue) => {
                console.log('n',newValue);
                console.log('s',setConsent);
                console.log('c',consent);
                const temp =  setConsent(consent.id, newValue)
                return temp
            }
        }))
    );

const updateRemotely = (
    hasConsented: boolean,
    consentId: string
): Promise<void> => setConsent(consentId, hasConsented);

export type { Consent, ConsentType };
export { get, updateRemotely, fetchConsents };
