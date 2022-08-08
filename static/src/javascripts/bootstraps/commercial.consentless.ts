import { initDynamicSlots } from 'commercial/modules/consentless/dynamic-slots';
import { initFixedSlots } from 'commercial/modules/consentless/fixed-slots';
import { init as initConsentless } from 'commercial/modules/consentless/prepare-ootag';

const init = async (): Promise<void> => {
	await Promise.all([
		initConsentless(),
		initFixedSlots(),
		initDynamicSlots(),
	]);
};

export { init };
