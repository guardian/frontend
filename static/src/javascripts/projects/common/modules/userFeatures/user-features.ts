/**
 * @file Sets the user subscription and ad free cookies
 * This file was migrated from:
 * https://github.com/guardian/commercial/blob/1a429d6be05657f20df4ca909df7d01a5c3d7402/src/lib/user-features.ts
 */

// import { getAuthStatus, isUserLoggedInOktaRefactor } from '../../lib/identity';
import { getAuthStatus, isUserLoggedIn } from '../identity/api';
import { ALLOW_REJECT_ALL_COOKIE } from './cookies/allowRejectAll';
import { createOrRenewCookie } from './cookies/cookieHelpers';
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
	if (
		(await isUserLoggedIn()) &&
		userBenefitsDataNeedsRefreshing()
	) {
		await requestNewData();
	}
};

const requestNewData = async () => {
	const authStatus = await getAuthStatus();
	if (
		authStatus.kind !== 'SignedIn'
	) {
		return Promise.reject('The user is not signed in');
	}
	return syncDataFromUserBenefitsApi(authStatus).then(persistResponse);
};

const persistResponse = (userBenefitsResponse: UserBenefits) => {
	createOrRenewCookie(USER_BENEFITS_EXPIRY_COOKIE);
	if (userBenefitsResponse.allowRejectAll) {
		createOrRenewCookie(ALLOW_REJECT_ALL_COOKIE);
	}
};

export { refreshUserBenefits };
