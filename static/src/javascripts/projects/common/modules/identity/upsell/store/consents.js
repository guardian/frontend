// @flow
import {
    getAllConsents,
    getUserFromApi,
    setConsent,
} from 'common/modules/identity/api';

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

const get = (): Promise<ConsentType[]> =>
    fetchConsents.then(([acceptedConsents, allConsents]) =>
        allConsents.map(consent => ({
            consent,
            hasConsented: acceptedConsents.includes(consent.id),
        }))
    );

const updateRemotely = (
    hasConsented: boolean,
    consentId: string
): Promise<void> => setConsent(consentId, hasConsented);

export type { Consent, ConsentType };
export { get, updateRemotely };
