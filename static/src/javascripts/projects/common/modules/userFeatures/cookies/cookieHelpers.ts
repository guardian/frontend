import { removeCookie, setCookie } from '@guardian/libs';
import { ALLOW_REJECT_ALL_COOKIE } from './allowRejectAll';
import { USER_BENEFITS_EXPIRY_COOKIE } from './userBenefitsExpiry';

export const timeInDaysFromNow = (daysFromNow: number): number => {
	const tmpDate = new Date();
	tmpDate.setDate(tmpDate.getDate() + daysFromNow);
	return tmpDate.getTime();
};

export const createOrRenewCookie = (
	cookieName: string,
	daysTillExpiry = 1,
): void => {
	const expiresValue = timeInDaysFromNow(daysTillExpiry);
	setCookie({
		name: cookieName,
		value: expiresValue.toString(),
		daysToLive: daysTillExpiry,
	});
};

export const deleteAllCookies = (): void => {
	removeCookie({ name: USER_BENEFITS_EXPIRY_COOKIE });
	removeCookie({ name: ALLOW_REJECT_ALL_COOKIE });
};
