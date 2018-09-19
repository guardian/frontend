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
    name: string,
    description: string,
    isOptOut: ?boolean,
    isChannel: ?boolean,
};

class ConsentWithState {
    consent: Consent;
    hasConsented: boolean;
    updateInApiFn: (cs: ConsentWithState[]) => Promise<void>;

    constructor(consent: Consent, hasConsented: ?boolean): void {
        this.consent = consent;
        this.hasConsented = hasConsented || false;
    }
    setState(hasConsented: boolean) {
        this.hasConsented = hasConsented;
    }
}

class UserConsentWithState extends ConsentWithState {
    static updateInApiFn = (cs: ConsentWithState[]) => {
        setConsent(
            cs.map(c => ({
                id: c.consent.id,
                consented: c.hasConsented || false,
            }))
        );
    };
}

class EmailConsentWithState extends ConsentWithState {
    static updateInApiFn = (cs: ConsentWithState[]) => {
        console.log(cs);
    };
}

const consentTypeList = [UserConsentWithState, EmailConsentWithState];

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
    allConsents.map(
        consent =>
            new UserConsentWithState(
                consent,
                acceptedConsents.includes(consent.id)
            )
    )
);

const fetchNewsletters = Promise.all([
    getAllNewsletters(),
    getSubscribedNewsletters(),
]).then(([allNewsletters, subscribedNewsletters]) =>
    allNewsletters.map(
        nl =>
            new EmailConsentWithState(
                nl,
                subscribedNewsletters.includes(nl.exactTargetListId)
            )
    )
);

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
    const consentsWithFunctions = consentTypeList.map(type => {
        const filteredConsents = consents.filter(c => c instanceof type);
        return filteredConsents ? type.updateInApiFn(filteredConsents) : true;
    });
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
