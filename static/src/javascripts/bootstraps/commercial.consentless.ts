import { fillAdvertSlots } from 'commercial/modules/consentless/fill-fixed-slots';
import { init as initConsentless } from 'commercial/modules/consentless/prepare-ootag';

const init = async (): Promise<void> => {
	await Promise.all([initConsentless(), fillAdvertSlots()]);
};

export { init };
