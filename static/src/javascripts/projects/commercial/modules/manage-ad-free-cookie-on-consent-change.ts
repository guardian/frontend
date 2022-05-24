import { onConsentChange } from '@guardian/consent-management-platform';
import { once } from 'lodash-es';
import {
	AdFreeCookieReasons,
	maybeUnsetAdFreeCookie,
	setAdFreeCookie,
} from 'lib/manage-ad-free-cookie';
import { removeSlots } from './remove-slots';

/**
 * If consent changes so that targeted advertising is disabled in tcfv2 regions,
 * remove ad slots and set adFree cookie so the server won't render them on subsequent page loads
 * Otherwise if in tcfv2 but consent to targeting is later allowed, removes the adFree cookie
 */
const manageAdFreeCookieOnConsentChange = once((): Promise<void> => {
	onConsentChange((consent) => {
		if (consent.tcfv2) {
			if (!consent.canTarget) {
				setAdFreeCookie(
					AdFreeCookieReasons.AdFreeCookieReasonUserOptOut,
				);
				void removeSlots();
			} else {
				maybeUnsetAdFreeCookie(
					AdFreeCookieReasons.AdFreeCookieReasonUserOptOut,
				);
			}
		}
	});
	return Promise.resolve();
});

export { manageAdFreeCookieOnConsentChange };
