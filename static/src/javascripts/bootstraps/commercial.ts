import { onConsent } from '@guardian/consent-management-platform';
import { init as initCommon } from './commercial.common';
import { init as initConsented } from './commercial.consented';
import { init as initConsentless } from './commercial.consentless';

const init = async (): Promise<void> => {
	await initCommon();
	const consentState = await onConsent();

	if (consentState.canTarget) {
		initConsented();
	} else {
		void initConsentless();
	}
};

void init();
