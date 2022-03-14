import { initTrackScrollDepth } from '@guardian/commercial-core';
import { log } from '@guardian/libs';
import { getEnhancedConsent } from 'common/modules/commercial/enhanced-consent';

/**
 * Initisalise scroll depth / velocity tracking if user has consented to relevant purposes.
 * @returns Promise
 */
export const init = async (): Promise<void> => {
	const state = await getEnhancedConsent();
	if (
		// Purpose 8 - Measure content performance
		(state.framework == 'tcfv2' && state.tcfv2?.consents[8]) ||
		state.canTarget
	) {
		initTrackScrollDepth();
		log('commercial', 'tracking scroll depth');
	} else {
		log('commercial', 'No consent to track scroll depth');
	}
	return Promise.resolve();
};
