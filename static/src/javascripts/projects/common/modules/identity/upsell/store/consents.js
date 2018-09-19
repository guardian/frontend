// @flow
import {
    getAllConsents,
    getAllNewsletters,
    getSubscribedNewsletters,
    getUserFromApi,
    setConsent,
} from 'common/modules/identity/api';

const consentTypes = {
    email: {
        updateFn: (cs: ConsentWithState[]) => {
            console.log(cs);
        },
    },
    marketing: {
        updateFn: (cs: ConsentWithState[]) => {
            setConsent(
                cs.map(c => ({
                    id: c.consent.id,
                    consented: c.hasConsented || false,
                }))
            );
        },
    },
};

type ConsentType = $Keys<typeof consentTypes>;

type Consent = {
    id: string,
    idType: ConsentType,
    name: string,
    description: string,
    isOptOut: ?boolean,
    isChannel: ?boolean,
};

type ConsentWithState = {
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

const getUserConsents = (): Promise<ConsentWithState[]> =>
    fetchUserConsents;

const getUserConsent = (consentId: string): Promise<?ConsentWithState> =>
    fetchUserConsents.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const getNewsletterConsents = (): Promise<ConsentWithState[]> =>
    fetchNewsletters;

const getNewsletterConsent = (
    consentId: string
): Promise<?ConsentWithState> =>
    fetchNewsletters.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const setConsentsInApi = (consents: ConsentWithState[]): Promise<any> => {
    const consentsWithFunctions = Object.entries(consentTypes).map(
        ([consentType, { updateFn }]) => {
            const filteredConsents = consents.filter(
                c => c.consent.idType === consentType
            );
            return filteredConsents ? updateFn(filteredConsents) : true;
        }
    );
    return Promise.all(consentsWithFunctions);
};

export type { Consent, ConsentWithState };
export {
    getUserConsent,
    getUserConsents,
    getNewsletterConsent,
    getNewsletterConsents,
    setConsentsInApi,
};
