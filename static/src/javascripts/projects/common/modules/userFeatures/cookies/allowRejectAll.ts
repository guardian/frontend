import { getCookie } from '@guardian/libs';
import { userBenefitsDataIsUpToDate } from './userBenefitsExpiry';

export const ALLOW_REJECT_ALL_COOKIE = 'gu_allow_reject_all';

export const allowRejectAll = (isSignedIn: boolean): boolean =>
	getAllowRejectAllCookie() !== null || // If the user has an allow-reject-all cookie, respect it
	(isSignedIn && !userBenefitsDataIsUpToDate()); // If they are signed in and their benefits are out of date, allow reject all for now

export const getAllowRejectAllCookie = (): string | null =>
	getCookie({ name: ALLOW_REJECT_ALL_COOKIE });
