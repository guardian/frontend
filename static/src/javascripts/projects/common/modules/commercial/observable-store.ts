import { onConsentChange } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import type { TCFv2ConsentList } from '@guardian/consent-management-platform/dist/types/tcfv2';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ConsentStateEnhanced } from 'commercial/types';
import { getPageTargeting } from './build-page-targeting';

const tcfv2ConsentedToAll = (consents: TCFv2ConsentList): boolean => {
	return (
		Object.keys(consents).length > 0 &&
		Object.values(consents).every(Boolean)
	);
};

const enhanceConsentState = (state: ConsentState): ConsentStateEnhanced => {
	if (state.ccpa) {
		return { ...state, canTarget: !state.ccpa.doNotSell };
	} else if (state.tcfv2) {
		return {
			...state,
			canTarget: tcfv2ConsentedToAll(state.tcfv2.consents),
		};
	} else if (state.aus) {
		return { ...state, canTarget: state.aus.personalisedAdvertising };
	}
	return { ...state, canTarget: false };
};

const consentObservable = new Observable<ConsentState>((subscriber) => {
	onConsentChange((consentState) => {
		if (consentState.tcfv2) {
			// For tcfv2 only, the first onConsentChange is fired before the user has
			// interacted with the consent banner. We want to ignore this first consentState.
			if (consentState.tcfv2.eventStatus !== 'cmpuishown') {
				subscriber.next(enhanceConsentState(consentState));
			}
		} else if (consentState.ccpa || consentState.aus) {
			subscriber.next(enhanceConsentState(consentState));
		}
	});
});

const pageTargetingObservable = consentObservable.pipe(
	map((consentState) => [consentState, getPageTargeting(consentState)]),
);

export { consentObservable, pageTargetingObservable };
