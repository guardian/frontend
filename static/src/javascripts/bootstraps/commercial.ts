import { onConsent } from '@guardian/consent-management-platform';
import { init as initConsented } from './commercial.consented';

void onConsent().then((consentState) => {
	if (consentState.canTarget) {
		initConsented();
	} else {
		// init opt-out-advertising
		console.log('NO CONSENT!!');
	}
});
