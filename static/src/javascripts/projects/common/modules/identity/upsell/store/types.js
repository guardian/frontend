// @flow
import { setConsent } from 'common/modules/identity/api';

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

export type { Consent, ConsentWithState };
export { UserConsentWithState, EmailConsentWithState, consentTypeList };
