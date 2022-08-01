import { onConsent } from '@guardian/consent-management-platform';
import { init as initConsented } from './standalone.commercial';

void onConsent().then((consentState) => {
	if (consentState.canTarget) {
		initConsented();
	} else {
		// init opt-out-advertising
	}
});
