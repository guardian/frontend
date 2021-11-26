/**
 * https://developers.google.com/search/docs/advanced/mobile/web-light
 */
const GOOGLE_WEB_LIGHT = 'googleweblight';

/**
 * This one is undocumented, not sure it actually exists.
 */
const GOOGLE_WEB_PREVIEW = 'Google Web Preview';

/**
 * Read more about Google Crawler here: https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers
 * @returns whether this is a Google Proxy
 */
export const isGoogleProxy = (): boolean =>
	Boolean(
		navigator.userAgent.includes(GOOGLE_WEB_PREVIEW) ||
			navigator.userAgent.includes(GOOGLE_WEB_LIGHT),
	);
