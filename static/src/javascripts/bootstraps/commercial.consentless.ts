import { init as initConsentless } from 'commercial/modules/consentless/prepare-ootag';

const init = (): Promise<void> => {
	initConsentless();
	return Promise.resolve();
};

export { init };
