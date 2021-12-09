import { onConsentChange } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';

/**
 * return a promise containing the first consent state provided by the user
 * as soon as it becomes available.
 * NOTE: depending on where this function is eventually used, it might be more appropriate
 * for it to be defined in the consent-management-platform
 * @returns Promise
 */
export const getInitialConsentState = (): Promise<ConsentState> => {
	let resolveInitialState: (state: ConsentState) => void;
	let rejectInitialState: (reason: 'Unknown framework') => void;
	const promise = new Promise<ConsentState>((resolve, reject) => {
		resolveInitialState = resolve;
		rejectInitialState = reject;
	});

	onConsentChange((state) => {
		if (state.tcfv2) {
			// For tcfv2 only, the first onConsentChange is fired before the user has
			// interacted with the consent banner. We want to ignore this first consent state.
			if (state.tcfv2.eventStatus !== 'cmpuishown')
				resolveInitialState({ tcfv2: state.tcfv2 });
			else return;
		}
		if (state.ccpa) {
			resolveInitialState({ ccpa: state.ccpa });
		}
		if (state.aus) {
			resolveInitialState({ aus: state.aus });
		}

		rejectInitialState('Unknown framework');
	});

	return promise;
};
