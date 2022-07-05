import { getCookie, removeCookie, setCookie } from '@guardian/libs';
import {
	cookieIsExpiredOrMissing,
	timeInDaysFromNow,
} from 'common/modules/commercial/lib/cookie';

// cookie to trigger server-side ad-freeness
const AD_FREE_USER_COOKIE = 'GU_AF1';

/*
 * The ad free cookie can be set for a few different reasons:
 * 1. The users is signed in and is a subscriber
 * 2. The user has opted out of targeted advertising
 * 3. The url parameter noadsaf is set so ads are temporarily disabled
 */
enum AdFreeCookieReasons {
	ConsentOptOut = 'consent_opt_out',
	Subscriber = 'subscriber',
	ForceAdFree = 'force_ad_free',
}

/*
 * Since the cookie is shared between these different use cases, we need to be careful to
 * only unset it when it's needed for none of the cases.
 * We keep track of the reasons for setting the ad cookie in an object in local storage
 * mapping reasons to expiry times.
 */
const AD_FREE_COOKIE_REASON_LS = 'gu.ad_free_cookie_reason';
type AdFreeCookieReasonExpiries = Partial<Record<AdFreeCookieReasons, string>>;

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

const getAdFreeCookieReason = (): AdFreeCookieReasonExpiries | undefined => {
	const adFreeReasonString = localStorage.getItem(AD_FREE_COOKIE_REASON_LS);
	if (!adFreeReasonString) {
		return;
	}
	return JSON.parse(adFreeReasonString) as AdFreeCookieReasonExpiries;
};

/*
 * Set the ad free cookie and update ad free cookie reason.
 * Don't set the reason for ForceAdFree as this is supposed to be overridden.
 *
 * @param reason
 * @param daysToLive - number of days the cookie should be valid
 */
const setAdFreeCookie = (reason: AdFreeCookieReasons, daysToLive = 1): void => {
	if (reason !== AdFreeCookieReasons.ForceAdFree) {
		const adFreeReason = getAdFreeCookieReason() ?? {};
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
 * Remove the given ad free reason.
 * If as a result, all ad free reasons are expired or null, unset the ad free cookie.
 * @param reason - the reason for which we may want to unset the ad free cookie
 */
const maybeUnsetAdFreeCookie = (reason: AdFreeCookieReasons): void => {
	const adFreeLocalStorageReason = getAdFreeCookieReason();

	/**
	 *  if consent is given but localStorage is missing, play it safe and assume the user should be ad free if they already are
	 * */
	if (
		!adFreeLocalStorageReason &&
		reason === AdFreeCookieReasons.ConsentOptOut &&
		adFreeDataIsPresent()
	) {
		return;
	}

	const adFreeReason = adFreeLocalStorageReason ?? {};

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
	AdFreeCookieReasons,
};
