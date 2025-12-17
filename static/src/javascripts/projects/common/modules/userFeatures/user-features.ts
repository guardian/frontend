/**
 * @file Sets the user subscription and ad free cookies
 * This file was migrated from:
 * https://github.com/guardian/commercial/blob/1a429d6be05657f20df4ca909df7d01a5c3d7402/src/lib/user-features.ts
 */

import { removeCookie } from '@guardian/libs';
import { getAuthStatus, isUserLoggedIn } from '../identity/api';
import { AD_FREE_USER_COOKIE } from './cookies/adFree';
import { ALLOW_REJECT_ALL_COOKIE } from './cookies/allowRejectAll';
import { createOrRenewCookie } from './cookies/cookieHelpers';
import { HIDE_SUPPORT_MESSAGING_COOKIE } from './cookies/hideSupportMessaging';
import {
	USER_BENEFITS_EXPIRY_COOKIE,
	userBenefitsDataNeedsRefreshing,
} from './cookies/userBenefitsExpiry';
import { syncDataFromUserBenefitsApi } from './userBenefitsApi';

export type UserBenefits = {
	adFree: boolean;
	hideSupportMessaging: boolean;
	allowRejectAll: boolean;
};

const refreshUserBenefits = async (): Promise<void> => {
	if ((await isUserLoggedIn()) && userBenefitsDataNeedsRefreshing()) {
		await requestNewData();
	}
};

const requestNewData = async () => {
	const authStatus = await getAuthStatus();
	if (authStatus.kind !== 'SignedIn') {
		return Promise.reject('The user is not signed in');
	}
	return syncDataFromUserBenefitsApi(authStatus).then(persistResponse);
};

const USER_BENEFITS_COOKIE_EXPIRATION_IN_DAYS = 30;

/**
 * Persist the user benefits response to cookies
 *
 * If new cookies are added/removed/edited, update the persistUserBenefitsCookies function in Gateway.
 * In gateway, the cookies are set after authentication.
 *
 * This code also exist in dotcom-rendering, so any changes here should be mirrored there.
 *
 * @param {UserBenefits} userBenefitsResponse
 */
const persistResponse = (userBenefitsResponse: UserBenefits) => {
	createOrRenewCookie(USER_BENEFITS_EXPIRY_COOKIE);

	// All of these user benefits cookies are now valid for 30 days. Previously
	// they were short lived (1-2 days) but this resulted in edge cases where if
	// a signed in user didn't visit the site for more than a couple of days
	// when they returned their first page view wouldn't reflect their benefits
	// (i.e. they would see ads). This is due to a race condition between the
	// user benefits refresh and the ads code. However, we don't want to delay
	// ads until after the user benefits have been refreshed as that would
	// impact performance. So instead, extend the expiry of the cookie. Note:
	// this may result in a user getting benefits they no longer have on the
	// first returning pageview, but this will be correct from the second page
	// view onwards. We think this is OK. This also means we now remove cookies
	// if the user benefits response says they no longer have the benefit,
	// rather than simply letting the cookie expire.
	if (userBenefitsResponse.hideSupportMessaging) {
		createOrRenewCookie(
			HIDE_SUPPORT_MESSAGING_COOKIE,
			USER_BENEFITS_COOKIE_EXPIRATION_IN_DAYS,
		);
	} else {
		removeCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE });
	}

	if (userBenefitsResponse.allowRejectAll) {
		createOrRenewCookie(
			ALLOW_REJECT_ALL_COOKIE,
			USER_BENEFITS_COOKIE_EXPIRATION_IN_DAYS,
		);
	} else {
		removeCookie({ name: ALLOW_REJECT_ALL_COOKIE });
	}

	if (userBenefitsResponse.adFree) {
		createOrRenewCookie(
			AD_FREE_USER_COOKIE,
			USER_BENEFITS_COOKIE_EXPIRATION_IN_DAYS,
		);
	} else {
		removeCookie({ name: AD_FREE_USER_COOKIE });
	}
};

export { refreshUserBenefits };
