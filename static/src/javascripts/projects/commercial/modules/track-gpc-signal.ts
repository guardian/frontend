/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

import { initTrackGpcSignal } from '@guardian/commercial-core';
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
