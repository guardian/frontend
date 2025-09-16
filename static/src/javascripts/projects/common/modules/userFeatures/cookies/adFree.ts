import { getCookie } from '@guardian/libs';
import { userBenefitsDataIsUpToDate } from './userBenefitsExpiry';

export const AD_FREE_USER_COOKIE = 'GU_AF1';

export const adFreeDataIsPresent = (isSignedIn: boolean): boolean =>
	getAdFreeCookie() !== null || // If the user has an ad-free cookie give them ad-free
	(isSignedIn && !userBenefitsDataIsUpToDate()); // If they are signed in and their benefits are out of date, give them ad-free for now

export const getAdFreeCookie = (): string | null =>
	getCookie({ name: AD_FREE_USER_COOKIE });

export const isAdFreeUser = () => {
	const cookieVal = getAdFreeCookie();
	if (!cookieVal) return false;
	return !Number.isNaN(parseInt(cookieVal, 10));
}
