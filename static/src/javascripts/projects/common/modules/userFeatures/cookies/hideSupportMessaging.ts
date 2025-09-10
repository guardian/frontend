import { getCookie } from '@guardian/libs';

export const HIDE_SUPPORT_MESSAGING_COOKIE = 'gu_hide_support_messaging';

export const hideSupportMessaging = (): boolean =>
	getHideSupportMessagingCookie() !== null;

export const getHideSupportMessagingCookie = (): string | null =>
	getCookie({ name: HIDE_SUPPORT_MESSAGING_COOKIE });
