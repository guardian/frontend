// @flow
import {
    getAllConsents,
    getAllNewsletters,
    getSubscribedNewsletters,
    getUserFromApi,
    setConsent,
} from 'common/modules/identity/api';

type Consent = {
    id: string,
    idType: 'email' | 'marketing',
    name: string,
    description: string,
    isOptOut: ?boolean,
    isChannel: ?boolean,
};

type ConsentType = {
    consent: Consent,
    hasConsented: ?boolean,
};

const fetchSubscribedConsents = (): Promise<string[]> =>
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

const fetchUserConsents = Promise.all([
    fetchSubscribedConsents(),
    getAllConsents(),
]).then(([acceptedConsents, allConsents]) =>
    allConsents.map(consent => ({
        consent: { ...consent, idType: 'marketing' },
        hasConsented: acceptedConsents.includes(consent.id),
    }))
);

const fetchNewsletters = Promise.all([
    getAllNewsletters(),
    getSubscribedNewsletters(),
]).then(([allNewsletters, subscribedNewsletters]) =>
    allNewsletters.map(nl => ({
        consent: { ...nl, idType: 'email' },
        hasConsented: subscribedNewsletters.includes(nl.exactTargetListId),
    }))
);

const getUserConsents = (): Promise<ConsentType[]> => fetchUserConsents;

const getUserConsent = (consentId: string): Promise<?ConsentType> =>
    fetchUserConsents.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const getNewsletterConsents = (): Promise<ConsentType[]> => fetchNewsletters;

const getNewsletterConsent = (consentId: string): Promise<?ConsentType> =>
    fetchNewsletters.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const setConsentsInApi = (consents: ConsentType[]): Promise<void> => {
    const mktConsents = consents
        .filter(c => c.consent.idType === 'marketing')
        .map(c => ({
            id: c.consent.id,
            consented: c.hasConsented,
        }));
    const emailConsents = consents.filter(c => c.consent.idType === 'email');
    return Promise.all([
        mktConsents ? setConsent(mktConsents) : true,
        emailConsents ? console.log(emailConsents) : true,
    ]);
};

export type { Consent, ConsentType };
export {
    getUserConsent,
    getUserConsents,
    getNewsletterConsent,
    getNewsletterConsents,
    setConsentsInApi,
};
