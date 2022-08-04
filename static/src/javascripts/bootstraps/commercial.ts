import { onConsent } from '@guardian/consent-management-platform';
import { createAdManager } from 'commercial/ad-manager';
import { init as initCommon } from './commercial.common';
import { init as initConsented } from './commercial.consented';
import { init as initConsentless } from './commercial.consentless';

const init = async (): Promise<void> => {
	await initCommon();
	const consentState = await onConsent();
	createAdManager(consentState).prepare();

	if (consentState.canTarget) {
		initConsented();
	} else {
		// init opt-out-advertising
		console.log('NO CONSENT!!');
		void initConsentless();
	}
};

void init();
