import { addCookie, removeCookie } from './cookies';

/*
 * Sets a cookie to trigger server-side ad-freeness
 * @param daysToLive - number of days the cookie should be valid
 */
const setAdFreeCookie = (daysToLive?: number): void => {
	const expires = new Date();
	expires.setMonth(expires.getMonth() + 6);
	addCookie('GU_AF1', expires.getTime(), daysToLive, true);
};

/*
 * Removes the cookie that causes server-side ad-freeness
 */
const unsetAdFreeCookie = (): void => {
	removeCookie('GU_AF1');
};

export { setAdFreeCookie, unsetAdFreeCookie };
