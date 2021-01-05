import {
    setConsent,
    buildNewsletterUpdatePayload,
    updateNewsletter,
} from 'common/modules/identity/api';


class ConsentWithState {
    consent;
    uniqueId;
    hasConsented;
    updateInApiFn;

    constructor(consent, hasConsented) {
        this.consent = consent;
        this.hasConsented = hasConsented || false;
    }

    setState(hasConsented) {
        this.hasConsented = hasConsented;
    }

    flipState() {
        this.hasConsented = !this.hasConsented;
    }
}

class UserConsentWithState extends ConsentWithState {
    constructor(...args) {
        super(...args);
        this.uniqueId = ['user', this.consent.id].join('-');
    }
    static updateInApiFn = (cs) =>
        setConsent(
            cs.map(c => ({
                id: c.consent.id,
                consented: c.hasConsented || false,
            }))
        );
}

class EmailConsentWithState extends ConsentWithState {
    constructor(...args) {
        super(...args);
        this.uniqueId = ['email', this.consent.id].join('-');
    }
    static updateInApiFn = (cs) =>
        Promise.all(
            cs.map(consent => {
                if (!consent.consent.exactTargetListId) return Promise.reject();
                return updateNewsletter(
                    buildNewsletterUpdatePayload(
                        consent.hasConsented ? 'add' : 'remove',
                        consent.consent.exactTargetListId
                    )
                );
            })
        ).then(() => {});
}

const consentTypeList = [UserConsentWithState, EmailConsentWithState];

export { UserConsentWithState, EmailConsentWithState, consentTypeList };
