import { fetchNewsletters, fetchUserConsents } from './fetch';
import { consentTypeList } from './types';

const getAllUserConsents = () =>
    fetchUserConsents;

const getUserConsent = (consentId) =>
    fetchUserConsents.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const getUserConsents = (
    consentIds
) =>
    fetchUserConsents.then(consents =>
        consents.filter(consent => consentIds.includes(consent.consent.id))
    );

const getAllNewsletterConsents = () =>
    fetchNewsletters;

const getNewsletterConsent = (consentId) =>
    fetchNewsletters.then(cs =>
        cs.find(consent => consent.consent.id === consentId)
    );

const getNewsLetterConsents = (
    consentIds
) =>
    fetchNewsletters.then(consents =>
        consents.filter(consent => consentIds.includes(consent.consent.id))
    );

const setConsentsInApi = (consents) => {
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
    getAllUserConsents,
    getNewsletterConsent,
    getNewsLetterConsents,
    getAllNewsletterConsents,
    setConsentsInApi,
};
