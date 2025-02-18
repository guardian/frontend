import { getCookie } from '@guardian/libs';

export const USER_BENEFITS_EXPIRY_COOKIE = 'gu_user_benefits_expiry';

export const getUserBenefitsExpiryCookie = (): string | null =>
	getCookie({ name: USER_BENEFITS_EXPIRY_COOKIE });

export const userBenefitsDataNeedsRefreshing = (): boolean =>
	!userBenefitsDataIsUpToDate();

export const userBenefitsDataIsUpToDate = (): boolean => {
	const cookieValue = getUserBenefitsExpiryCookie();
	if (!cookieValue) return false;
	const expiryTime = parseInt(cookieValue, 10);
	const timeNow = new Date().getTime();
	return timeNow < expiryTime;
};
