// @flow
import { fetchNewsletters, fetchUserConsents } from './fetch';
import { consentTypeList, UserConsentWithState } from './types';
import type { ConsentWithState } from './types';

const getUserConsents = (): Promise<UserConsentWithState[]> =>
    fetchUserConsents;

const getUserConsent = (consentId: string): Promise<?UserConsentWithState> =>
    fetchUserConsents.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const getNewsletterConsents = (): Promise<ConsentWithState[]> =>
    fetchNewsletters;

const getNewsletterConsent = (consentId: string): Promise<?ConsentWithState> =>
    fetchNewsletters.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const setConsentsInApi = (consents: ConsentWithState[]): Promise<any> => {
    /*
    This function takes n consents then will split
    them into all consent types, then will use the send
    to api fn for that consent type. The reason for this is
    that an arbitrary number of consents of different types
    can be set at once.
    */
    const consentsWithFunctions = consentTypeList.map(type => {
        const filteredConsents = consents.filter(c => c instanceof type);
        return filteredConsents && filteredConsents.length
            ? type.updateInApiFn(filteredConsents)
            : true;
    });
    return Promise.all(consentsWithFunctions);
};

export {
    getUserConsent,
    getUserConsents,
    getNewsletterConsent,
    getNewsletterConsents,
    setConsentsInApi,
};
