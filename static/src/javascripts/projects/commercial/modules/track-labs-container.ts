import { initTrackLabsContainer } from '@guardian/commercial/core';
import { onConsent } from '@guardian/consent-management-platform';
import { log } from '@guardian/libs';

/**
 * Initialise labs container tracking if user has consented to relevant purposes.
 * @returns Promise
 */
export const init = async (): Promise<void> => {
	const state = await onConsent();
	if (
		// Purpose 8 - Measure content performance
		(state.framework == 'tcfv2' && state.tcfv2?.consents[8]) ||
		state.canTarget
	) {
		initTrackLabsContainer();
		log('commercial', 'Tracking labs container');
	} else {
		log('commercial', 'No consent to track labs container');
	}
};
