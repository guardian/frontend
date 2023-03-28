/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

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
const _manageAdFreeCookieOnConsentChange = (): void => {
	onConsentChange((consent) => {
		if (consent.framework === 'tcfv2') {
			if (!consent.canTarget) {
				setAdFreeCookie(AdFreeCookieReasons.ConsentOptOut);
				void removeSlots();
			} else {
				maybeUnsetAdFreeCookie(AdFreeCookieReasons.ConsentOptOut);
			}
		}
	});
};

const manageAdFreeCookieOnConsentChange = once(() =>
	Promise.resolve(_manageAdFreeCookieOnConsentChange()),
);

export const _ = { _manageAdFreeCookieOnConsentChange };
export { manageAdFreeCookieOnConsentChange };
