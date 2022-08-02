import { onConsent } from '@guardian/consent-management-platform';
import { init as initCommon } from './commercial.common';
import { init as initConsented } from './commercial.consented';
import { init as initConsentless } from './commercial.consentless';

const init = (): Promise<void> =>
	initCommon().then(() =>
		onConsent().then((consentState) => {
			if (consentState.canTarget) {
				initConsented();
			} else {
				// init opt-out-advertising
				console.log('NO CONSENT!!');
				void initConsentless();
			}
		}),
	);

void init();
