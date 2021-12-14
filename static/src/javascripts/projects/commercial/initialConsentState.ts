import { onConsentChange } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';

/**
 * Return a promise containing the first consent state provided by the user
 * as soon as it becomes available. This will only resolve once whereas
 * callbacks passed to onConsentChange are executed each time consent state changes.
 * Avoid using this function in contexts where subsequent consent states must be listened for.
 *
 * NOTE: depending on where this function is eventually used, it might be more appropriate
 * for it to be defined in the consent-management-platform
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
				resolveInitialState(state);
			else return;
		} else if (state.ccpa || state.aus) {
			resolveInitialState(state);
		}

		rejectInitialState('Unknown framework');
	});

	return promise;
};
