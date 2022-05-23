import { onConsentChange } from '@guardian/consent-management-platform';
import { once } from 'lodash-es';
import {
	AD_FREE_COOKIE_REASON_LS,
	AdFreeCookieReasons,
	isDigitalSubscriber,
	setAdFreeCookieReason,
} from 'common/modules/commercial/user-features';
import { setAdFreeCookie, unsetAdFreeCookie } from 'lib/set-ad-free-cookie';
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
				setAdFreeCookie();
				setAdFreeCookieReason(
					AdFreeCookieReasons.AdFreeCookieReasonUserOptOut,
				);
				void removeSlots();
			} else {
				unsetAdFreeCookie();
				localStorage.removeItem(AD_FREE_COOKIE_REASON_LS);
			}
		}
		// Handle case where a user who isn't logged in opts out and gets the ad-free cookie and reason set
		// then logs in as a subscriber. Ad-free reason flag should be removed.
		if (consent.tcfv2 && isDigitalSubscriber()) {
			localStorage.removeItem(AD_FREE_COOKIE_REASON_LS);
		}
	});
	return Promise.resolve();
});

export { manageAdFreeCookieOnConsentChange };
