import { onConsentChange } from '@guardian/consent-management-platform';
import type { ConsentState } from '@guardian/consent-management-platform/dist/types';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getPageTargeting } from './build-page-targeting';
import { enhanceConsentState } from './get-enhanced-consent';

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
