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
    uniqueId: string;
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
    constructor(...args: any[]) {
        super(...args);
        this.uniqueId = ['user', this.consent.id].join('-');
    }
    static updateInApiFn = (cs: ConsentWithState[]): Promise<void> =>
        setConsent(
            cs.map(c => ({
                id: c.consent.id,
                consented: c.hasConsented || false,
            }))
        );
}

class EmailConsentWithState extends ConsentWithState {
    constructor(...args: any[]) {
        super(...args);
        this.uniqueId = ['email', this.consent.id].join('-');
    }
    static updateInApiFn = (cs: ConsentWithState[]): Promise<void> => {
        console.log(cs);
        return Promise.resolve();
    };
}

const consentTypeList = [UserConsentWithState, EmailConsentWithState];

export type { Consent, ConsentWithState };
export { UserConsentWithState, EmailConsentWithState, consentTypeList };
