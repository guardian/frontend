import { init as initConsentless } from 'commercial/modules/consentless/prepare-ootag';

const init = async (): Promise<void> => {
	await Promise.all([initConsentless()]);
};

export { init };
