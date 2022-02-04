import { onConsentChange } from '@guardian/consent-management-platform';
import type {
	ConsentState,
	Framework,
} from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentList } from '@guardian/consent-management-platform/dist/types/tcfv2';

type ConsentStateEnhanced = ConsentState & {
	canTarget: boolean;
	framework: Framework | null;
};

const tcfv2ConsentedToAll = (consents: TCFv2ConsentList): boolean => {
	return (
		Object.keys(consents).length > 0 &&
		Object.values(consents).every(Boolean)
	);
};

const buildConsentStateEnhanced = (
	consentState: ConsentState,
	canTarget: boolean,
	framework: Framework | null,
): ConsentStateEnhanced => ({
	...consentState,
	canTarget,
	framework,
});

const enhanceConsentState = (state: ConsentState): ConsentStateEnhanced => {
	if (state.tcfv2) {
		return buildConsentStateEnhanced(
			state,
			tcfv2ConsentedToAll(state.tcfv2.consents),
			'tcfv2',
		);
	} else if (state.ccpa) {
		return buildConsentStateEnhanced(state, !state.ccpa.doNotSell, 'ccpa');
	} else if (state.aus) {
		return buildConsentStateEnhanced(
			state,
			state.aus.personalisedAdvertising,
			'aus',
		);
	}
	return buildConsentStateEnhanced(state, false, null);
};

/**
 * Resolves `ConsentStateEnhanced` which enhances `ConsentState` with two properties:
 * - `canTarget`: if the user can be targeted for personalisation according to the active consent framework
 * - `framework`: the active consent framework
 *
 * @returns Promise<ConsentStateEnhanced>
 */
const getEnhancedConsent = (): Promise<ConsentStateEnhanced> =>
	new Promise<ConsentStateEnhanced>((resolve, reject) => {
		onConsentChange((consentState) => {
			if (consentState.tcfv2) {
				// For tcfv2 only, the first onConsentChange is fired before the user has
				// interacted with the consent banner. We want to ignore this first consent state.
				if (consentState.tcfv2.eventStatus !== 'cmpuishown') {
					resolve(enhanceConsentState(consentState));
				}
				return;
			} else if (consentState.ccpa || consentState.aus) {
				resolve(enhanceConsentState(consentState));
			}

			reject('Unknown framework');
		});
	});

export type { ConsentStateEnhanced };

export { enhanceConsentState, getEnhancedConsent };
