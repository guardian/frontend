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
export const getInitialConsentState = (): Promise<ConsentState> =>
	new Promise<ConsentState>((resolve, reject) => {
		onConsentChange((consentState: ConsentState) => {
			if (consentState.tcfv2) {
				// For tcfv2 only, the first onConsentChange is fired before the user has
				// interacted with the consent banner. We want to ignore this first consent state.
				if (consentState.tcfv2.eventStatus !== 'cmpuishown') {
					resolve(consentState);
				}
				return;
			} else if (consentState.ccpa || consentState.aus) {
				resolve(consentState);
			}

			reject('Unknown framework');
		});
	});
