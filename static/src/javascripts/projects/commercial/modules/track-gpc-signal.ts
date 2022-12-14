import { initTrackGpcSignal } from '@guardian/commercial/core';
import { onConsent } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { log } from '@guardian/libs';

/**
 * Initialise gpc signal tracking
 * @returns Promise
 */
export const init = async (): Promise<void> => {
	const consentState: ConsentState = await onConsent();

	if (consentState.canTarget) {
		initTrackGpcSignal(consentState);
		log('commercial', 'tracking gpc signal');
	} else {
		log('commercial', 'No consent to track gpc signal');
	}
};
