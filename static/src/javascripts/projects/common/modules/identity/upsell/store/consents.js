// @flow
import {
    getAllConsents,
    getUserFromApi,
    setConsent,
} from 'common/modules/identity/api';
import type { Followable } from 'common/modules/identity/upsell/consent-card/FollowCard';

type Consent = {
    id: string,
    idType: 'email' | 'marketing',
    name: string,
    description: string,
    isOptOut: boolean,
    isChannel: boolean,
};

type ConsentType<T: Consent> = {
    consent: T,
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

const fetchMarketingConsents = Promise.all([getUserConsents(), getAllConsents()]).then(([acceptedConsents, allConsents]) =>
    allConsents.map(consent => ({
        consent: consent,
        hasConsented: acceptedConsents.includes(consent.id),
    })));

const getMarketingConsents = (): Promise<ConsentType[]> => fetchMarketingConsents;

const getMarketingConsent = (consentId: string): Promise<?ConsentType> => {
    return fetchMarketingConsents.then(cs=>cs.find(consent => consent.consent.id === consentId));
};

const setConsentsInApi = (consents:ConsentType[]): Promise<void> => {
    const mktConsents = consents.filter(c => c.consent.idType === 'marketing').map(c => ({
        id: c.consent.id,
        consented: c.hasConsented
    }));
    return Promise.all([
        mktConsents?setConsent(mktConsents):true
    ]);

};

export type { Consent, ConsentType };
export { getMarketingConsent, getMarketingConsents, setConsentsInApi };
