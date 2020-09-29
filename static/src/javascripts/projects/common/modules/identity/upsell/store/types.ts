
import { setConsent, buildNewsletterUpdatePayload, updateNewsletter } from "common/modules/identity/api";

type Consent = {
  id: string;
  name: string;
  description: string;
  isOptOut: boolean | null | undefined;
  isChannel: boolean | null | undefined;
  exactTargetListId: string | null | undefined;
};

class ConsentWithState {

  consent: Consent;
  uniqueId: string;
  hasConsented: boolean;
  updateInApiFn: (cs: ConsentWithState[]) => Promise<void>;

  constructor(consent: Consent, hasConsented: boolean | null | undefined): void {
    this.consent = consent;
    this.hasConsented = hasConsented || false;
  }

  setState(hasConsented: boolean) {
    this.hasConsented = hasConsented;
  }

  flipState() {
    this.hasConsented = !this.hasConsented;
  }
}

class UserConsentWithState extends ConsentWithState {

  constructor(...args: any[]) {
    super(...args);
    this.uniqueId = ['user', this.consent.id].join('-');
  }
  static updateInApiFn = (cs: ConsentWithState[]): Promise<void> => setConsent(cs.map(c => ({
    id: c.consent.id,
    consented: c.hasConsented || false
  })));
}

class EmailConsentWithState extends ConsentWithState {

  constructor(...args: any[]) {
    super(...args);
    this.uniqueId = ['email', this.consent.id].join('-');
  }
  static updateInApiFn = (cs: ConsentWithState[]): Promise<void> => Promise.all(cs.map(consent => {
    if (!consent.consent.exactTargetListId) return Promise.reject();
    return updateNewsletter(buildNewsletterUpdatePayload(consent.hasConsented ? 'add' : 'remove', consent.consent.exactTargetListId));
  })).then(() => {});
}

const consentTypeList = [UserConsentWithState, EmailConsentWithState];

export { Consent, ConsentWithState };
export { UserConsentWithState, EmailConsentWithState, consentTypeList };