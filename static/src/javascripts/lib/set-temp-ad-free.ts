import { addCookie } from './cookies';

/*
 * Sets a short-lived cookie to trigger server-side ad-freeness
 * @param forcedAdFreeValidSeconds - number of seconds the cookie should be valid
 */
const setTempAdFreeCookie = (forcedAdFreeValidSeconds = 30): void => {
	const daysToLive = 1;
	const isCrossSubDomain = true;
	const forcedAdFreeExpiryTime = new Date();
	forcedAdFreeExpiryTime.setTime(
		forcedAdFreeExpiryTime.getTime() + forcedAdFreeValidSeconds * 1000,
	);
	addCookie(
		'GU_AF1',
		forcedAdFreeExpiryTime.getTime().toString(),
		daysToLive,
		isCrossSubDomain,
	);
};

export { setTempAdFreeCookie };
