import { getCookie } from '@guardian/libs';

export const timeInDaysFromNow = (daysFromNow: number): string => {
	const tmpDate = new Date();
	tmpDate.setDate(tmpDate.getDate() + daysFromNow);
	return tmpDate.getTime().toString();
};

export const cookieIsExpiredOrMissing = (cookieName: string): boolean => {
	const expiryDateFromCookie = getCookie({ name: cookieName });
	if (!expiryDateFromCookie) return true;
	const expiryTime = parseInt(expiryDateFromCookie, 10);
	const timeNow = new Date().getTime();
	return timeNow >= expiryTime;
};
