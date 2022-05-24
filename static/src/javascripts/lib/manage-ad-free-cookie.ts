import { getCookie, removeCookie, setCookie } from '@guardian/libs';
import {
	cookieIsExpiredOrMissing,
	timeInDaysFromNow,
} from 'common/modules/commercial/utils';

const AD_FREE_USER_COOKIE = 'GU_AF1';
const AD_FREE_COOKIE_REASON_LS = 'gu.ad_free_cookie_reason';
export enum AdFreeCookieReasons {
	ConsentOptOut = 'consent_opt_out',
	Subscriber = 'subscriber',
	ForceAdFree = 'force_ad_free',
}

const getAdFreeCookie = (): string | null =>
	getCookie({ name: AD_FREE_USER_COOKIE });

const adFreeDataIsOld = (): boolean => {
	const { switches } = window.guardian.config;
	return (
		Boolean(switches.adFreeStrictExpiryEnforcement) &&
		cookieIsExpiredOrMissing(AD_FREE_USER_COOKIE)
	);
};

const adFreeDataIsPresent = (): boolean => {
	const cookieVal = getAdFreeCookie();
	if (!cookieVal) return false;
	return !Number.isNaN(parseInt(cookieVal, 10));
};

const getAdFreeCookieReason = () => {
	const adFreeReasonString = localStorage.getItem(AD_FREE_COOKIE_REASON_LS);
	return JSON.parse(adFreeReasonString ?? '{}') as Partial<
		Record<AdFreeCookieReasons, string>
	>;
};

/*
 * Sets a cookie to trigger server-side ad-freeness
 * @param daysToLive - number of days the cookie should be valid
 */
const setAdFreeCookie = (reason: AdFreeCookieReasons, daysToLive = 1): void => {
	if (reason !== AdFreeCookieReasons.ForceAdFree) {
		const adFreeReason = getAdFreeCookieReason();
		adFreeReason[reason] = timeInDaysFromNow(daysToLive);

		localStorage.setItem(
			AD_FREE_COOKIE_REASON_LS,
			JSON.stringify(adFreeReason),
		);
	}

	const expires = new Date();
	expires.setMonth(expires.getMonth() + 6);
	setCookie({
		name: AD_FREE_USER_COOKIE,
		value: expires.getTime().toString(),
		daysToLive,
	});
};

/*
 * Removes the cookie that causes server-side ad-freeness
 */
const maybeUnsetAdFreeCookie = (reason: AdFreeCookieReasons): void => {
	const adFreeReason = getAdFreeCookieReason();

	delete adFreeReason[reason];

	localStorage.setItem(
		AD_FREE_COOKIE_REASON_LS,
		JSON.stringify(adFreeReason),
	);

	const allExpired = Object.entries(AdFreeCookieReasons).every(
		([, reason]) => {
			const expiry = adFreeReason[reason];
			if (expiry) {
				const expiryTime = parseInt(expiry, 10);
				const timeNow = new Date().getTime();
				return timeNow >= expiryTime;
			}
			return true;
		},
	);

	if (allExpired) {
		removeCookie({ name: AD_FREE_USER_COOKIE });
	}
};

export {
	setAdFreeCookie,
	getAdFreeCookie,
	maybeUnsetAdFreeCookie,
	adFreeDataIsOld,
	adFreeDataIsPresent,
};
